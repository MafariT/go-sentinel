package models

import (
	"time"
)

type Check struct {
	ID         int64     `json:"-"`
	MonitorID  int64     `json:"monitor_id"`
	StatusCode int       `json:"-"`
	Latency    int64     `json:"latency"`
	IsUp       bool      `json:"is_up"`
	CheckedAt  time.Time `json:"checked_at"`
}
