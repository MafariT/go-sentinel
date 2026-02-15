package db

import (
	"database/sql"
	"go-sentinel/internal/models"
	"time"
)

func CreateMonitor(db *sql.DB, monitor models.Monitor) (int64, error) {
	query := "INSERT INTO monitors (name, url, interval) VALUES (?, ?, ?)"

	result, err := db.Exec(query, monitor.Name, monitor.URL, monitor.Interval)
	if err != nil {
		return 0, err
	}

	return result.LastInsertId()
}

func GetMonitors(db *sql.DB) ([]models.Monitor, error) {
	query := "SELECT id, name, url, interval, last_checked_at, created_at FROM monitors"

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var monitors []models.Monitor
	for rows.Next() {
		var m models.Monitor
		var lastChecked sql.NullTime
		if err := rows.Scan(&m.ID, &m.Name, &m.URL, &m.Interval, &lastChecked, &m.CreatedAt); err != nil {
			return nil, err
		}
		if lastChecked.Valid {
			m.LastCheckedAt = &lastChecked.Time
		}
		monitors = append(monitors, m)
	}

	return monitors, nil
}

func UpdateLastChecked(db *sql.DB, monitorID int64) error {
	query := "UPDATE monitors SET last_checked_at = ? WHERE id = ?"
	_, err := db.Exec(query, time.Now(), monitorID)
	return err
}

func SaveCheck(db *sql.DB, check models.Check) error {
	query := "INSERT INTO checks (monitor_id, status_code, latency, is_up) VALUES (?, ?, ?, ?)"
	_, err := db.Exec(query, check.MonitorID, check.StatusCode, check.Latency, check.IsUp)
	return err
}
