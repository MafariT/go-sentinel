import { ExternalLink, Trash2 } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, ReferenceLine } from 'recharts';
import type { Monitor, Check } from '../types';

interface MonitorListProps {
  monitors: Monitor[];
  checks: Record<number, Check[]>;
  loading: boolean;
  monitorHistory: Record<number, any[]>;
  onDelete: (id: number) => void;
  isAdmin: boolean;
}

export function MonitorList({ monitors, checks, loading, monitorHistory, onDelete, isAdmin }: MonitorListProps) {
  if (loading) {
    return (
      <div className="space-y-1 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-[#1a1a1a] rounded animate-pulse border border-[#262626] flex items-center px-4">
            <div className="w-2.5 h-2.5 rounded-full bg-[#333] mr-4"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-[#333] rounded w-1/4"></div>
              <div className="h-2 bg-[#333] rounded w-1/3"></div>
            </div>
            <div className="w-32 h-8 bg-[#333] rounded mx-4"></div>
            <div className="w-12 h-3 bg-[#333] rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (monitors.length === 0) {
    return (
      <div className="p-16 text-center text-[#444] text-sm flex flex-col items-center">
        <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-4">
          <ExternalLink size={24} className="opacity-20" />
        </div>
        <p>No monitors configured.</p>
        {isAdmin && <p className="mt-2 text-xs text-[#666]">Click "+ Add Monitor" to start tracking.</p>}
      </div>
    );
  }

  return (
    <div className="bg-[#111111]">
      {monitors.map((m, i) => {
        const data = monitorHistory[m.id] || [];
        const latestCheck = checks[m.id] && checks[m.id].length > 0 ? checks[m.id][0] : null;
        const isUp = latestCheck?.is_up ?? null;
        const lastLatency = data.length > 0 ? data[data.length - 1].latency : 0;
        
        // Calculate average for reference line
        const avg = data.length > 0 ? data.reduce((a: any, b: any) => a + b.latency, 0) / data.length : 0;

        const gridCols = isAdmin 
          ? 'md:grid-cols-[2fr_3fr_100px_80px_60px]' 
          : 'md:grid-cols-[2fr_3fr_100px_80px]';

        return (
          <div key={m.id} className={`group grid grid-cols-1 ${gridCols} items-center px-5 py-4 hover:bg-[#161616] transition-all duration-200 ${i !== monitors.length - 1 ? 'border-b border-[#262626]' : ''}`}>
            {/* Name & Status Header */}
            <div className="flex items-center gap-4 md:mb-0 mb-3 w-full">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.5)] transition-all duration-500 ${isUp === true ? 'bg-[#2f855a] shadow-[#2f855a]/40' : isUp === false ? 'bg-[#c53030] shadow-[#c53030]/40' : 'bg-[#4a5568]'}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between md:justify-start gap-2">
                  <div className="text-[14px] font-bold text-white leading-tight flex items-center gap-2">
                    {m.name}
                    {isUp === false && <span className="text-[9px] bg-red-900/30 text-red-500 px-1.5 py-0.5 rounded border border-red-900/50 uppercase tracking-wide font-bold animate-pulse">Down</span>}
                  </div>
                  {/* Mobile Actions */}
                  <div className="md:hidden">
                    {isAdmin && (
                      <button onClick={() => onDelete(m.id)} className="text-[#444] hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#666] hover:text-[#f6821f] transition-colors flex items-center gap-1 truncate font-mono mt-0.5">
                  {m.url} <ExternalLink size={10} />
                </a>
              </div>
            </div>

            {/* Sparkline */}
            <div className="h-12 w-full opacity-70 group-hover:opacity-100 transition-opacity md:pr-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '10px', padding: '4px 8px' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ display: 'none' }}
                    cursor={{ stroke: '#333' }}
                    formatter={(value: any) => [`${value}ms`, 'Latency']}
                  />
                  <ReferenceLine y={avg} stroke="#333" strokeDasharray="3 3" />
                  <Line 
                    type="monotone" 
                    dataKey="latency" 
                    stroke={isUp === false ? "#fc8181" : "#48bb78"} 
                    strokeWidth={1.5} 
                    dot={false} 
                    activeDot={{ r: 3, strokeWidth: 0 }}
                    animationDuration={1000}
                  />
                  <YAxis hide domain={['0', 'dataMax + 10']} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Metrics */}
            <div className="flex justify-between items-center md:contents mt-2 md:mt-0">
              <div className="flex md:block flex-col items-center">
                <span className="md:hidden text-[9px] text-[#444] uppercase tracking-wider mb-1">Latency</span>
                <div className="text-right text-[12px] font-mono font-bold text-[#f6821f]">
                  {lastLatency}ms
                </div>
              </div>

              <div className="flex md:block flex-col items-center">
                <span className="md:hidden text-[9px] text-[#444] uppercase tracking-wider mb-1">Interval</span>
                <div className="text-right text-[12px] text-[#666] font-mono">
                  {m.interval}s
                </div>
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:block text-right">
                {isAdmin && (
                  <button 
                    onClick={() => onDelete(m.id)}
                    className="text-[#333] hover:text-red-500 p-2 rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Monitor"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
