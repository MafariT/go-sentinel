package models

import (
	"time"
)

type Check struct {
	ID         int64     `db:"id" json:"id"`
	MonitorID  int64     `db:"monitor_id" json:"monitor_id"`
	StatusCode int       `db:"status_code" json:"status_code"`
	Latency    int64     `db:"latency" json:"latency"`
	IsUp       bool      `db:"is_up" json:"is_up"`
	CheckedAt  time.Time `db:"checked_at" json:"checked_at"`
}
