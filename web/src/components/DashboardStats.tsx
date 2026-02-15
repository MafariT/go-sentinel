import { Activity, Clock, AlertCircle } from 'lucide-react';
import type { MonitorStats } from '../types';

interface DashboardStatsProps {
  stats: MonitorStats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const isHealthy = stats.down === 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* System Status Card */}
      <div className={`p-4 rounded-lg border ${isHealthy ? 'bg-green-950/10 border-green-900/30' : 'bg-red-950/10 border-red-900/30'} flex flex-col justify-between h-24 relative overflow-hidden group`}>
        <div className="flex items-center justify-between z-10">
          <span className={`text-xs font-bold uppercase tracking-widest ${isHealthy ? 'text-green-500' : 'text-red-500'}`}>System Status</span>
          {isHealthy ? <Activity size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-red-500" />}
        </div>
        <div className={`text-xl font-bold z-10 ${isHealthy ? 'text-green-400' : 'text-red-400'}`}>
          {isHealthy ? 'All Systems Operational' : `${stats.down} Service(s) Down`}
        </div>
        {/* Ambient Glow */}
        <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-20 ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>

      {/* Up / Down Split */}
      <div className="p-4 rounded-lg bg-[#111] border border-[#262626] flex flex-col justify-between h-24">
        <div className="flex items-center justify-between text-[#666]">
          <span className="text-xs font-bold uppercase tracking-widest">Uptime</span>
          <Activity size={16} />
        </div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-green-500">{stats.up}</span>
          <span className="text-sm text-[#444] mb-1">/</span>
          <span className="text-sm text-[#444] mb-1">{stats.total}</span>
        </div>
      </div>

      {/* Avg Latency */}
      <div className="p-4 rounded-lg bg-[#111] border border-[#262626] flex flex-col justify-between h-24">
        <div className="flex items-center justify-between text-[#666]">
          <span className="text-xs font-bold uppercase tracking-widest">Global Latency</span>
          <Clock size={16} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[#f6821f]">{stats.avgLatency}</span>
          <span className="text-xs text-[#666] pt-2">ms</span>
        </div>
      </div>
    </div>
  );
}
