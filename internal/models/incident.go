package models

import "time"

type Incident struct {
	ID          int64     `db:"id" json:"id"`
	Title       string    `db:"title" json:"title"`
	Description string    `db:"description" json:"description"`
	Status      string    `db:"status" json:"status"` // investigating, monitoring, resolved
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time `db:"updated_at" json:"updated_at"`
}
