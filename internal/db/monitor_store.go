package db

import (
	"context"
	"database/sql"
	"go-sentinel/internal/models"
	"time"
)

func CreateMonitor(ctx context.Context, db *sql.DB, monitor models.Monitor) (int64, error) {
	query := "INSERT INTO monitors (name, url, interval) VALUES (?, ?, ?)"

	result, err := db.ExecContext(ctx, query, monitor.Name, monitor.URL, monitor.Interval)
	if err != nil {
		return 0, err
	}

	return result.LastInsertId()
}

func UpdateMonitor(ctx context.Context, db *sql.DB, monitor models.Monitor) error {
	if monitor.URL == "" {
		_, err := db.ExecContext(ctx, "UPDATE monitors SET name = ?, interval = ? WHERE id = ?", monitor.Name, monitor.Interval, monitor.ID)
		return err
	}
	_, err := db.ExecContext(ctx, "UPDATE monitors SET name = ?, url = ?, interval = ? WHERE id = ?", monitor.Name, monitor.URL, monitor.Interval, monitor.ID)
	return err
}

func GetMonitors(ctx context.Context, db *sql.DB) ([]models.Monitor, error) {
	query := "SELECT id, name, url, interval, last_checked_at FROM monitors"

	rows, err := db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var monitors []models.Monitor
	for rows.Next() {
		var m models.Monitor
		var lastChecked sql.NullTime
		if err := rows.Scan(&m.ID, &m.Name, &m.URL, &m.Interval, &lastChecked); err != nil {
			return nil, err
		}
		if lastChecked.Valid {
			m.LastCheckedAt = &lastChecked.Time
		}
		monitors = append(monitors, m)
	}

	return monitors, nil
}

func UpdateLastChecked(ctx context.Context, db *sql.DB, monitorID int64) error {
	query := "UPDATE monitors SET last_checked_at = ? WHERE id = ?"
	_, err := db.ExecContext(ctx, query, time.Now(), monitorID)
	return err
}

func DeleteMonitor(ctx context.Context, db *sql.DB, id int) error {
	_, err := db.ExecContext(ctx, "DELETE FROM checks WHERE monitor_id = ?", id)
	if err != nil {
		return err
	}
	_, err = db.ExecContext(ctx, "DELETE FROM monitors WHERE id = ?", id)
	return err
}
