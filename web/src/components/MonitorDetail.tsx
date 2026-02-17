import React, { useEffect, useState, useCallback } from 'react';
import { Activity, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { colors, chartStyles } from '@/constants/theme';
import type { Monitor, DailyStats } from '@/types';

interface MonitorDetailProps {
  monitor: Monitor;
  fetchHistory: (id: number) => Promise<DailyStats[]>;
}

export const MonitorDetail = React.memo(function MonitorDetail({ monitor, fetchHistory }: MonitorDetailProps) {
  const [history, setHistory] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    const data = await fetchHistory(monitor.id);
    setHistory(data.reverse());
    setLoading(false);
  }, [monitor.id, fetchHistory]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse bg-background border-x border-b border-border -mt-[1px] mb-4 mx-2 rounded-b-lg">
        Loading 30-day analytics...
      </div>
    );
  }

  const uptime30d = history.length > 0 
    ? (history.reduce((acc, day) => acc + day.uptime_pct, 0) / history.length).toFixed(2)
    : '---';

  const avgLatency30d = history.length > 0
    ? Math.round(history.reduce((acc, day) => acc + day.avg_latency, 0) / history.length)
    : 0;

  return (
    <div className="bg-background border-x border-b border-border -mt-[1px] mb-4 mx-2 rounded-b-lg p-6 animate-in slide-in-from-top-2 fade-in duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Heatmap */}
        <div className="lg:col-span-1 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#161616] p-3 rounded border border-border">
              <div className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold mb-1">30-Day Uptime</div>
              <div className={`text-2xl font-bold ${Number(uptime30d) >= 99 ? 'text-green-500' : 'text-orange-500'}`}>
                {uptime30d}%
              </div>
            </div>
            <div className="bg-[#161616] p-3 rounded border border-border">
              <div className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Avg Latency</div>
              <div className="text-2xl font-bold text-primary">
                {avgLatency30d}<span className="text-sm font-normal text-muted-foreground ml-1">ms</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-muted-foreground" />
              <h3 className="text-xs font-bold text-foreground">Daily History</h3>
            </div>
            <div className="flex gap-[2px] h-12 w-full">
              {Array.from({ length: 30 - history.length }).map((_, i) => (
                <div key={`empty-${i}`} className="flex-1 bg-[#161616] rounded-[1px]" />
              ))}
              
              {history.map((day) => (
                <div 
                  key={day.date}
                  className={`flex-1 rounded-[1px] transition-opacity hover:opacity-80 relative group ${
                    day.uptime_pct >= 99 ? 'bg-status-up' : 
                    day.uptime_pct >= 95 ? 'bg-orange-500' : 'bg-red-600'
                  }`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10 border border-border-muted">
                    {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: {day.uptime_pct.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground mt-1 font-mono">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Right Column: Chart */}
        <div className="lg:col-span-2 h-48 lg:h-auto">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={14} className="text-muted-foreground" />
            <h3 className="text-[13px] font-bold text-foreground">Daily Latency Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <XAxis 
                dataKey="date" 
                stroke={colors.border.muted} 
                fontSize={10} 
                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                tick={{ fill: colors.text.muted }}
              />
              <YAxis stroke={colors.border.muted} fontSize={10} tick={{ fill: colors.text.muted }} width={30} />
              <Tooltip 
                contentStyle={chartStyles.tooltip}
                labelStyle={{ color: colors.text.description, fontSize: '12px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Line 
                type="monotone" 
                dataKey="avg_latency" 
                stroke={colors.status.up} 
                strokeWidth={2} 
                dot={false}
                activeDot={{ r: 4, stroke: colors.bg.secondary, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
});
