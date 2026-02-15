import { useEffect, useState } from 'react';
import { Activity, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Monitor } from '../types';

interface MonitorDetailProps {
  monitor: Monitor;
  fetchHistory: (id: number) => Promise<any[]>;
}

export function MonitorDetail({ monitor, fetchHistory }: MonitorDetailProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchHistory(monitor.id).then(data => {
      if (mounted) {
        setHistory(data.reverse());
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [monitor.id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-[#444] animate-pulse bg-[#0f0f0f] border-x border-b border-[#262626] -mt-[1px] mb-4 mx-2 rounded-b-lg">
        Loading 30-day analytics...
      </div>
    );
  }

  // Calculate stats
  const uptime30d = history.length > 0 
    ? (history.reduce((acc, day) => acc + day.uptime_pct, 0) / history.length).toFixed(2)
    : '---';

  const avgLatency30d = history.length > 0
    ? Math.round(history.reduce((acc, day) => acc + day.avg_latency, 0) / history.length)
    : 0;

  return (
    <div className="bg-[#0f0f0f] border-x border-b border-[#262626] -mt-[1px] mb-4 mx-2 rounded-b-lg p-6 animate-in slide-in-from-top-2 fade-in duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Heatmap */}
        <div className="lg:col-span-1 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#161616] p-3 rounded border border-[#262626]">
              <div className="text-[10px] text-[#666] uppercase tracking-widest font-bold mb-1">30-Day Uptime</div>
              <div className={`text-xl font-bold ${Number(uptime30d) >= 99 ? 'text-green-500' : 'text-orange-500'}`}>
                {uptime30d}%
              </div>
            </div>
            <div className="bg-[#161616] p-3 rounded border border-[#262626]">
              <div className="text-[10px] text-[#666] uppercase tracking-widest font-bold mb-1">Avg Latency</div>
              <div className="text-xl font-bold text-[#f6821f]">
                {avgLatency30d}<span className="text-xs font-normal text-[#666] ml-1">ms</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-[#666]" />
              <h3 className="text-xs font-bold text-white">Daily History</h3>
            </div>
            <div className="flex gap-[2px] h-8 w-full">
              {history.map((day) => (
                <div 
                  key={day.date}
                  className={`flex-1 rounded-[1px] transition-opacity hover:opacity-80 relative group ${
                    day.uptime_pct >= 99 ? 'bg-[#2f855a]' : 
                    day.uptime_pct >= 95 ? 'bg-orange-500' : 'bg-red-600'
                  }`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10 border border-[#333]">
                    {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: {day.uptime_pct.toFixed(1)}%
                  </div>
                </div>
              ))}
              {Array.from({ length: 30 - history.length }).map((_, i) => (
                <div key={`empty-${i}`} className="flex-1 bg-[#1a1a1a] rounded-[1px]" />
              ))}
            </div>
            <div className="flex justify-between text-[9px] text-[#444] mt-1 font-mono">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Right Column: Chart */}
        <div className="lg:col-span-2 h-48 lg:h-auto">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={14} className="text-[#666]" />
            <h3 className="text-xs font-bold text-white">Daily Latency Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <XAxis 
                dataKey="date" 
                stroke="#333" 
                fontSize={9} 
                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                tick={{ fill: '#444' }}
              />
              <YAxis stroke="#333" fontSize={9} tick={{ fill: '#444' }} width={30} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                labelStyle={{ color: '#888', fontSize: '11px' }}
                itemStyle={{ fontSize: '11px' }}
              />
              <Line 
                type="monotone" 
                dataKey="avg_latency" 
                stroke="#f6821f" 
                strokeWidth={2} 
                dot={false}
                activeDot={{ r: 4, stroke: '#111', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
