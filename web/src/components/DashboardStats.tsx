import { Activity, AlertCircle } from 'lucide-react';
import type { MonitorStats } from '../types';

interface DashboardStatsProps {
  stats: MonitorStats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const isHealthy = stats.down === 0;

  return (
    <div className="mb-6">
      {/* System Status Card */}
      <div className={`p-5 rounded-lg border ${isHealthy ? 'bg-green-950/10 border-green-900/30' : 'bg-red-950/10 border-red-900/30'} flex items-center justify-between h-20 relative overflow-hidden group`}>
        <div className="flex items-center gap-4 z-10">
          <div className={`p-2 rounded-full ${isHealthy ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            {isHealthy ? <Activity size={24} className="text-green-500" /> : <AlertCircle size={24} className="text-red-500" />}
          </div>
          <div>
            <div className={`text-sm font-bold uppercase tracking-widest ${isHealthy ? 'text-green-500' : 'text-red-500'}`}>System Status</div>
            <div className={`text-xl font-bold ${isHealthy ? 'text-green-400' : 'text-red-400'}`}>
              {isHealthy ? 'All Systems Operational' : `${stats.down} Service(s) experiencing issues`}
            </div>
          </div>
        </div>
        
        <div className="z-10 text-[10px] font-mono text-[#444] uppercase tracking-tighter">
          Real-time check
        </div>

        {/* Ambient Glow */}
        <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${isHealthy ? 'bg-green-500' : 'bg-[#2f855a]'}`} />
      </div>
    </div>
  );
}
