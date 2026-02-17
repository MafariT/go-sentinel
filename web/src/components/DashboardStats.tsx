import { Activity, AlertCircle } from 'lucide-react';
import type { MonitorStats } from '@/types';

interface DashboardStatsProps {
  stats: MonitorStats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const isHealthy = stats.down === 0;

  return (
    <div className="mb-6">
      {/* System Status Card */}
      <div className={`p-5 rounded-lg border ${isHealthy ? 'bg-primary/5 border-primary/30' : 'bg-destructive/5 border-destructive/30'} flex items-center justify-between h-20 relative overflow-hidden group`}>
        <div className="flex items-center gap-4 z-10">
          <div className={`p-2 rounded-full ${isHealthy ? 'bg-primary/20' : 'bg-destructive/20'}`}>
            {isHealthy ? <Activity size={24} className="text-primary" /> : <AlertCircle size={24} className="text-destructive" />}
          </div>
          <div>
            <div className={`text-[15px] font-bold uppercase tracking-widest ${isHealthy ? 'text-primary' : 'text-destructive'}`}>System Status</div>
            <div className={`text-2xl font-bold ${isHealthy ? 'text-primary' : 'text-destructive'}`}>
              {isHealthy ? 'All Systems Operational' : `${stats.down} Service(s) experiencing issues`}
            </div>
          </div>
        </div>
        
        <div className="z-10 text-[11px] font-mono text-muted-foreground uppercase tracking-tighter">
          Real-time check
        </div>

        {/* Ambient Glow */}
        <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${isHealthy ? 'bg-primary' : 'bg-destructive'}`} />
      </div>
    </div>
  );
}
