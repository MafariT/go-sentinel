export interface Monitor {
  id: number;
  name: string;
  url: string;
  interval: number;
  last_checked_at: string | null;
}

export interface Check {
  monitor_id: number;
  latency: number;
  is_up: boolean;
  checked_at: string;
}

export interface MonitorStats {
  total: number;
  up: number;
  down: number;
  avgLatency: number;
}

export interface Incident {
  id: number;
  title: string;
  description: string;
  status: 'investigating' | 'monitoring' | 'resolved';
  created_at: string;
}

export interface DailyStats {
  date: string;
  uptime_pct: number;
  avg_latency: number;
}

export interface ApiError {
  response?: {
    status: number;
    data?: {
      error?: string;
    };
  };
  message: string;
}
