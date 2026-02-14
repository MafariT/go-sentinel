package models

import (
	"time"
)

type Monitor struct {
	ID        int       `db:"id" json:"id"`
	Name      string    `db:"name" json:"name"`
	URL       string    `db:"url" json:"url"`
	Interval  int       `db:"interval" json:"interval"` // in seconds
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}

type Check struct {
	ID         int       `db:"id" json:"id"`
	MonitorID  int       `db:"monitor_id" json:"monitor_id"`
	StatusCode int       `db:"status_code" json:"status_code"`
	Latency    int64     `db:"latency" json:"latency"`
	IsUp       bool      `db:"is_up" json:"is_up"`
	CheckedAt  time.Time `db:"checked_at" json:"checked_at"`
}
