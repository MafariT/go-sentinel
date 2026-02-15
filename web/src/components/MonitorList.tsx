import { ExternalLink, RefreshCw, Trash2 } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import type { Monitor, Check } from '../types';

interface MonitorListProps {
  monitors: Monitor[];
  checks: Check[];
  loading: boolean;
  monitorHistory: Record<number, any[]>;
  onDelete: (id: number) => void;
  isAdmin: boolean;
}

export function MonitorList({ monitors, checks, loading, monitorHistory, onDelete, isAdmin }: MonitorListProps) {
  if (loading) {
    return (
      <div className="p-12 text-center text-[#444] animate-pulse flex justify-center items-center gap-2">
        <RefreshCw className="animate-spin" size={16}/> Loading monitors...
      </div>
    );
  }

  if (monitors.length === 0) {
    return (
      <div className="p-16 text-center text-[#444] text-sm">
        No monitors configured. Add one above to start tracking.
      </div>
    );
  }

  return (
    <>
      {monitors.map((m, i) => {
        const data = monitorHistory[m.id] || [];
        const latestCheck = checks.find(c => c.monitor_id === m.id);
        const isUp = latestCheck?.is_up ?? null;
        const lastLatency = data.length > 0 ? data[data.length - 1].latency : 0;

        return (
          <div key={m.id} className={`group grid grid-cols-[3fr_2fr_100px_80px_60px] items-center px-5 py-4 hover:bg-[#1a1a1a] transition-colors ${i !== monitors.length - 1 ? 'border-b border-[#262626]' : ''}`}>
            <div className="flex items-center gap-4">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.5)] ${isUp === true ? 'bg-[#2f855a] shadow-[#2f855a]/40' : isUp === false ? 'bg-[#c53030] shadow-[#c53030]/40' : 'bg-[#4a5568]'}`} />
              <div className="min-w-0">
                <div className="text-[14px] font-bold text-white leading-tight mb-1 flex items-center gap-2">
                  {m.name}
                  {isUp === false && <span className="text-[9px] bg-red-900/30 text-red-500 px-1.5 py-0.5 rounded border border-red-900/50 uppercase tracking-wide">Down</span>}
                </div>
                <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#666] hover:text-[#f6821f] transition-colors flex items-center gap-1 truncate font-mono">
                  {m.url} <ExternalLink size={10} />
                </a>
              </div>
            </div>

            <div className="h-10 w-full opacity-70 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <Line 
                    type="monotone" 
                    dataKey="latency" 
                    stroke={isUp === false ? "#fc8181" : "#48bb78"} 
                    strokeWidth={1.5} 
                    dot={false} 
                    isAnimationActive={false}
                  />
                  <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="text-right text-[12px] font-mono font-bold text-[#f6821f]">
              {lastLatency}ms
            </div>

            <div className="text-right text-[12px] text-[#666] font-mono">
              {m.interval}s
            </div>

            <div className="text-right">
              {isAdmin && (
                <button 
                  onClick={() => onDelete(m.id)}
                  className="text-[#333] hover:text-red-500 p-2 rounded transition-colors"
                  title="Delete Monitor"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
