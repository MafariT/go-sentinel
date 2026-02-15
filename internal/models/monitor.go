package models

import (
	"time"
)

type Monitor struct {
	ID            int64      `json:"id"`
	Name          string     `json:"name"`
	URL           string     `json:"-"`
	Interval      int        `json:"interval"`
	LastCheckedAt *time.Time `json:"last_checked_at,omitempty"`
}


