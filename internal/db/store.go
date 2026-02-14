package db

import (
	"database/sql"
	"go-sentinel/internal/models"
)

func Initialize(db *sql.DB) error {
	const schema = `
	CREATE TABLE IF NOT EXISTS monitors (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		url TEXT NOT NULL,
		interval INTEGER DEFAULT 60,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	
	CREATE TABLE IF NOT EXISTS checks (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		monitor_id INTEGER,
		status_code INTEGER,
		latency INTEGER,
		is_up BOOLEAN,
		checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (monitor_id) REFERENCES monitors (id)
	);
	`

	_, err := db.Exec(schema)
	if err != nil {
		return err
	}

	return nil
}

func CreateMonitor(db *sql.DB, monitor models.Monitor) (int64, error) {
	query := "INSERT INTO monitors (name, url, interval) VALUES (?, ?, ?)"

	result, err := db.Exec(query, monitor.Name, monitor.URL, monitor.Interval)
	if err != nil {
		return 0, err
	}	

	return result.LastInsertId()
}