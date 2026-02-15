package models

type DailyStat struct {
	MonitorID    int64   `json:"monitor_id"`
	Date         string  `json:"date"`
	UptimePct    float64 `json:"uptime_pct"`
	AvgLatency   int64   `json:"avg_latency"`
}

type MonitorSummary struct {
	MonitorID int64   `json:"monitor_id"`
	Uptime30d float64 `json:"uptime_30d"`
}
