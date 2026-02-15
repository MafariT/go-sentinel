package models

import (
	"time"
)

type Monitor struct {
	ID            int64      `db:"id" json:"id"`
	Name          string     `db:"name" json:"name"`
	URL           string     `db:"url" json:"url"`
	Interval      int        `db:"interval" json:"interval"`
	LastCheckedAt *time.Time `db:"last_checked_at" json:"last_checked_at,omitempty"`
	CreatedAt     time.Time  `db:"created_at" json:"created_at"`
}