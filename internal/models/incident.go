package models

import "time"

type Incident struct {
	ID          int64     `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Status      string    `json:"status"` // investigating, monitoring, resolved
	CreatedAt   time.Time `json:"created_at"`
}
