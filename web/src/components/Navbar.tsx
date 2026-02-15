import { Activity, Server, Clock } from 'lucide-react';
import type { MonitorStats } from '../types';

interface NavbarProps {
  monitorCount: number;
  stats: MonitorStats;
  showAdd: boolean;
  setShowAdd: (show: boolean) => void;
}

export function Navbar({ monitorCount, stats, showAdd, setShowAdd }: NavbarProps) {
  return (
    <nav className="border-b border-[#262626] bg-[#111111] h-14 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <Activity size={20} className="text-[#f6821f]" />
        <span className="font-bold text-white text-base tracking-tight">Go-Sentinel</span>
      </div>
      
      <div className="flex items-center gap-4 text-xs font-mono text-[#666]">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-[#1a1a1a] rounded border border-[#262626]">
              <Server size={12} className="text-[#f6821f]" />
              {monitorCount} Targets
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-[#1a1a1a] rounded border border-[#262626]">
              <Clock size={12} className="text-blue-500" />
              {stats.avgLatency}ms Avg
          </span>
          <button 
              onClick={() => setShowAdd(!showAdd)}
              className="bg-[#f6821f] hover:bg-[#eb7612] text-white px-3 py-1.5 rounded font-bold transition-colors ml-2"
          >
              {showAdd ? 'Cancel' : '+ Add Monitor'}
          </button>
      </div>
    </nav>
  );
}
