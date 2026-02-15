export interface Monitor {
  id: number;
  name: string;
  url: string;
  interval: number;
  last_checked_at: string | null;
}

export interface Check {
  id: number;
  monitor_id: number;
  status_code: number;
  latency: number;
  is_up: boolean;
  checked_at: string;
}

export interface MonitorStats {
  totalChecks: number;
  avgLatency: number;
  upMonitors: number;
}
