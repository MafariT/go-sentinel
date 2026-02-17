import React, { useState } from 'react';
import { Trash2, Edit2, ChevronDown, ChevronRight } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { MonitorDetail } from './MonitorDetail';
import { colors, chartStyles } from '@/constants/theme';
import type { Monitor, Check, DailyStats } from '@/types';

interface MonitorListProps {
  monitors: Monitor[];
  checks: Record<number, Check[]>;
  loading: boolean;
  monitorHistory: Record<number, Check[]>;
  dailyHistory: Record<number, DailyStats[]>;
  onDelete: (id: number) => void;
  onEdit: (monitor: Monitor) => void;
  fetchHistory: (id: number) => Promise<DailyStats[]>;
  isAdmin: boolean;
}

export const MonitorList = React.memo(function MonitorList({ monitors, checks, loading, monitorHistory, dailyHistory, onDelete, onEdit, fetchHistory, isAdmin }: MonitorListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const gridCols = isAdmin 
    ? 'md:grid-cols-[2fr_3fr_100px_80px_80px]' 
    : 'md:grid-cols-[2fr_3fr_100px_80px]';

  if (loading) {
    return (
      <div className="bg-card">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`grid grid-cols-1 ${gridCols} items-center px-5 py-4 border-b border-border`}>
            <div className="flex items-center gap-4">
              <div className="w-3.5 h-3.5 bg-muted rounded-full mr-1 animate-pulse" />
              <div className="w-2.5 h-2.5 bg-muted rounded-full animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-muted rounded w-24 animate-pulse" />
              </div>
            </div>
            <div className="h-10 bg-muted/50 rounded mx-4 hidden md:block animate-pulse" />
            <div className="flex justify-end pr-2"><div className="h-3 bg-muted rounded w-12 animate-pulse" /></div>
            <div className="flex justify-end pr-2"><div className="h-3 bg-muted rounded w-10 animate-pulse" /></div>
            {isAdmin && <div className="flex justify-end"><div className="h-4 bg-muted rounded w-4 animate-pulse" /></div>}
          </div>
        ))}
      </div>
    );
  }

  if (monitors.length === 0) {
    return (
      <div className="p-16 text-center text-muted-foreground text-sm flex flex-col items-center">
        <p>No monitors configured.</p>
        {isAdmin && <p className="mt-2 text-xs">Click "+ Add Monitor" to start tracking.</p>}
      </div>
    );
  }

  return (
    <div className="bg-card">
      {monitors.map((m, i) => {
        const isExpanded = expandedId === m.id;
        const data = monitorHistory[m.id] || [];
        const daily = [...(dailyHistory[m.id] || [])].reverse();
        const latestCheck = checks[m.id] && checks[m.id].length > 0 ? checks[m.id][0] : null;
        const isUp = latestCheck?.is_up ?? null;
        const lastLatency = data.length > 0 ? data[data.length - 1].latency : 0;
        
        const avg = data.length > 0 ? data.reduce((sum, check) => sum + check.latency, 0) / data.length : 0;

        return (
          <div key={m.id}>
            <div 
              onClick={() => toggleExpand(m.id)}
              className={`group grid grid-cols-1 ${gridCols} items-center px-5 py-4 hover:bg-muted/50 cursor-pointer ${i !== monitors.length - 1 || isExpanded ? 'border-b border-border' : ''}`}
            >
              <div className="flex items-center gap-4 md:mb-0 mb-3 w-full">
                <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.5)] transition-all duration-500 ${isUp === true ? 'bg-primary shadow-primary/40' : isUp === false ? 'bg-destructive shadow-destructive/40' : 'bg-muted'}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between md:justify-start gap-2">
                    <div className="text-[15px] font-bold text-foreground leading-tight flex items-center gap-2">
                      {m.name}
                      {isUp === false && <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded border border-destructive/50 uppercase tracking-wide font-bold animate-pulse">Down</span>}
                    </div>
                    <div className="md:hidden flex gap-2">
                      {isAdmin && (
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onEdit(m); }} 
                            className="text-muted-foreground hover:text-foreground"
                            aria-label={`Edit ${m.name} monitor`}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(m.id); }} 
                            className="text-text-secondary hover:text-red-500"
                            aria-label={`Delete ${m.name} monitor`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Mini Heatmap */}
                  <div className="flex gap-[1px] h-3 mt-2 w-full max-w-[240px]">
                    {Array.from({ length: Math.max(0, 30 - daily.length) }).map((_, i) => (
                      <div key={`empty-${i}`} className="flex-1 bg-[#161616] rounded-[1px]" />
                    ))}
                    {daily.map((day, idx) => (
                      <div 
                        key={idx}
                        className={`flex-1 rounded-[1px] ${
                          day.uptime_pct >= 99 ? 'bg-status-up' : 
                          day.uptime_pct >= 95 ? 'bg-orange-500' : 'bg-red-600'
                        }`}
                        title={`${new Date(day.date).toLocaleDateString()}: ${day.uptime_pct.toFixed(1)}%`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-12 w-full opacity-70 group-hover:opacity-100 transition-opacity md:pr-6" onClick={(e) => e.stopPropagation()}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <Tooltip 
                      contentStyle={chartStyles.tooltip}
                      itemStyle={chartStyles.tooltipItem}
                      labelStyle={chartStyles.tooltipLabel}
                      cursor={chartStyles.cursor}
                      labelFormatter={(_, payload) => {
                        if (payload && payload.length > 0) {
                          const date = new Date(payload[0].payload.checked_at);
                          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                        }
                        return '';
                      }}
                      formatter={(value: number | undefined) => [`${value ?? 0}ms`, 'Latency']}
                    />
                    <ReferenceLine y={avg} stroke={colors.border.muted} strokeDasharray="3 3" />
                    <Line 
                      type="monotone" 
                      dataKey="latency" 
                      stroke={isUp === false ? colors.status.downLight : colors.status.up} 
                      strokeWidth={1.5} 
                      dot={false} 
                      activeDot={{ r: 3, strokeWidth: 0 }}
                      animationDuration={1000}
                    />
                    <YAxis hide domain={['0', 'dataMax + 10']} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-between items-center md:contents mt-2 md:mt-0">
                <div className="flex md:block flex-col items-center">
                  <span className="md:hidden text-[10px] text-text-muted uppercase tracking-wider mb-1">Latency</span>
                  <div className="text-right text-[13px] font-mono font-bold text-status-up">
                    {lastLatency}ms
                  </div>
                </div>

                <div className="flex md:block flex-col items-center">
                  <span className="md:hidden text-[10px] text-text-muted uppercase tracking-wider mb-1">Interval</span>
                  <div className="text-right text-[13px] text-text-secondary font-mono">
                    {m.interval}s
                  </div>
                </div>

                <div className="hidden md:block text-right z-10 relative">
                  {isAdmin && (
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(m); }}
                        className="text-text-secondary hover:text-white p-2 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit Monitor"
                        aria-label={`Edit ${m.name} monitor`}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(m.id); }}
                        className="text-text-secondary hover:text-red-500 p-2 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Monitor"
                        aria-label={`Delete ${m.name} monitor`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {isExpanded && (
              <MonitorDetail monitor={m} fetchHistory={fetchHistory} />
            )}
          </div>
        );
      })}
    </div>
  );
});
