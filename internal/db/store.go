package db

import (
	"database/sql"
	"go-sentinel/internal/models"
	"strconv"
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

func GetChecks(db *sql.DB, limitPerMonitor int) (map[int64][]models.Check, error) {
	query := `
		SELECT id, monitor_id, status_code, latency, is_up, checked_at
		FROM (
			SELECT *, ROW_NUMBER() OVER (PARTITION BY monitor_id ORDER BY checked_at DESC) as rn
			FROM checks
		)
		WHERE rn <= ?
	`

	rows, err := db.Query(query, limitPerMonitor)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	grouped := make(map[int64][]models.Check)
	for rows.Next() {
		var c models.Check
		if err := rows.Scan(&c.ID, &c.MonitorID, &c.StatusCode, &c.Latency, &c.IsUp, &c.CheckedAt); err != nil {
			return nil, err
		}
		grouped[c.MonitorID] = append(grouped[c.MonitorID], c)
	}

	return grouped, nil
}

func DeleteMonitor(db *sql.DB, id int) error {
	_, err := db.Exec("DELETE FROM checks WHERE monitor_id = ?", id)
	if err != nil {
		return err
	}
	_, err = db.Exec("DELETE FROM monitors WHERE id = ?", id)
	return err
}

func CleanupOldChecks(db *sql.DB, days int) (int64, error) {
	query := "DELETE FROM checks WHERE checked_at < datetime('now', ?)"
	interval := "-" + strconv.Itoa(days) + " days"
	result, err := db.Exec(query, interval)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}
