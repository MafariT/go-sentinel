import { useState } from 'react';
import { Trash2, Edit2, ChevronDown, ChevronRight } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { MonitorDetail } from './MonitorDetail';
import type { Monitor, Check } from '../types';

interface MonitorListProps {
  monitors: Monitor[];
  checks: Record<number, Check[]>;
  loading: boolean;
  monitorHistory: Record<number, any[]>;
  dailyHistory: Record<number, any[]>;
  onDelete: (id: number) => void;
  onEdit: (monitor: Monitor) => void;
  fetchHistory: (id: number) => Promise<any[]>;
  isAdmin: boolean;
}

export function MonitorList({ monitors, checks, loading, monitorHistory, dailyHistory, onDelete, onEdit, fetchHistory, isAdmin }: MonitorListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const gridCols = isAdmin 
    ? 'md:grid-cols-[2fr_3fr_100px_80px_80px]' 
    : 'md:grid-cols-[2fr_3fr_100px_80px]';

  if (loading) {
    return (
      <div className="bg-[#111111]">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`grid grid-cols-1 ${gridCols} items-center px-5 py-4 border-b border-[#262626]`}>
            <div className="flex items-center gap-4">
              <div className="w-3.5 h-3.5 bg-[#1a1a1a] rounded-full mr-1" />
              <div className="w-2.5 h-2.5 bg-[#1a1a1a] rounded-full" />
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-[#1a1a1a] rounded w-24" />
              </div>
            </div>
            <div className="h-10 bg-[#161616] rounded mx-4 hidden md:block" />
            <div className="flex justify-end pr-2"><div className="h-3 bg-[#1a1a1a] rounded w-12" /></div>
            <div className="flex justify-end pr-2"><div className="h-3 bg-[#1a1a1a] rounded w-10" /></div>
            {isAdmin && <div className="flex justify-end"><div className="h-4 bg-[#1a1a1a] rounded w-4" /></div>}
          </div>
        ))}
      </div>
    );
  }

  if (monitors.length === 0) {
    return (
      <div className="p-16 text-center text-[#444] text-sm flex flex-col items-center">
        <p>No monitors configured.</p>
        {isAdmin && <p className="mt-2 text-xs text-[#666]">Click "+ Add Monitor" to start tracking.</p>}
      </div>
    );
  }

  return (
    <div className="bg-[#111111]">
      {monitors.map((m, i) => {
        const isExpanded = expandedId === m.id;
        const data = monitorHistory[m.id] || [];
        const daily = [...(dailyHistory[m.id] || [])].reverse();
        const latestCheck = checks[m.id] && checks[m.id].length > 0 ? checks[m.id][0] : null;
        const isUp = latestCheck?.is_up ?? null;
        const lastLatency = data.length > 0 ? data[data.length - 1].latency : 0;
        
        const avg = data.length > 0 ? data.reduce((a: any, b: any) => a + b.latency, 0) / data.length : 0;

        return (
          <div key={m.id}>
            <div 
              onClick={() => toggleExpand(m.id)}
              className={`group grid grid-cols-1 ${gridCols} items-center px-5 py-4 hover:bg-[#161616] cursor-pointer ${i !== monitors.length - 1 || isExpanded ? 'border-b border-[#262626]' : ''}`}
            >
              <div className="flex items-center gap-4 md:mb-0 mb-3 w-full">
                <div className="text-[#444] group-hover:text-[#666] transition-colors">
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.5)] transition-all duration-500 ${isUp === true ? 'bg-[#2f855a] shadow-[#2f855a]/40' : isUp === false ? 'bg-[#c53030] shadow-[#c53030]/40' : 'bg-[#4a5568]'}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between md:justify-start gap-2">
                    <div className="text-[15px] font-bold text-white leading-tight flex items-center gap-2">
                      {m.name}
                      {isUp === false && <span className="text-[10px] bg-red-900/30 text-red-500 px-1.5 py-0.5 rounded border border-red-900/50 uppercase tracking-wide font-bold animate-pulse">Down</span>}
                    </div>
                    <div className="md:hidden flex gap-2">
                      {isAdmin && (
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onEdit(m); }} 
                            className="text-[#666] hover:text-white"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(m.id); }} 
                            className="text-[#666] hover:text-red-500"
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
                      <div key={`empty-${i}`} className="flex-1 bg-[#1a1a1a] rounded-[1px]" />
                    ))}
                    {daily.map((day, idx) => (
                      <div 
                        key={idx}
                        className={`flex-1 rounded-[1px] ${
                          day.uptime_pct >= 99 ? 'bg-[#2f855a]' : 
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
                      contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '10px', padding: '4px 8px' }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#666', marginBottom: '2px', fontSize: '9px' }}
                      cursor={{ stroke: '#333' }}
                      labelFormatter={(_, payload) => {
                        if (payload && payload.length > 0) {
                          const date = new Date(payload[0].payload.checked_at);
                          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                        }
                        return '';
                      }}
                      formatter={(value: any) => [`${value}ms`, 'Latency']}
                    />
                    <ReferenceLine y={avg} stroke="#333" strokeDasharray="3 3" />
                    <Line 
                      type="monotone" 
                      dataKey="latency" 
                      stroke={isUp === false ? "#fc8181" : "#2f855a"} 
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
                  <span className="md:hidden text-[10px] text-[#444] uppercase tracking-wider mb-1">Latency</span>
                  <div className="text-right text-[13px] font-mono font-bold text-[#2f855a]">
                    {lastLatency}ms
                  </div>
                </div>

                <div className="flex md:block flex-col items-center">
                  <span className="md:hidden text-[10px] text-[#444] uppercase tracking-wider mb-1">Interval</span>
                  <div className="text-right text-[13px] text-[#666] font-mono">
                    {m.interval}s
                  </div>
                </div>

                <div className="hidden md:block text-right z-10 relative">
                  {isAdmin && (
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(m); }}
                        className="text-[#666] hover:text-white p-2 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit Monitor"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(m.id); }}
                        className="text-[#666] hover:text-red-500 p-2 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Monitor"
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
}
