package db

import (
	"context"
	"database/sql"
	"go-sentinel/internal/models"
	"strconv"
)

func SaveCheck(ctx context.Context, db *sql.DB, check models.Check) error {
	query := "INSERT INTO checks (monitor_id, status_code, latency, is_up) VALUES (?, ?, ?, ?)"
	_, err := db.ExecContext(ctx, query, check.MonitorID, check.StatusCode, check.Latency, check.IsUp)
	return err
}

func GetChecks(ctx context.Context, db *sql.DB, limitPerMonitor int) (map[int64][]models.Check, error) {
	query := `
		SELECT id, monitor_id, status_code, latency, is_up, checked_at
		FROM (
			SELECT *, ROW_NUMBER() OVER (PARTITION BY monitor_id ORDER BY checked_at DESC) as rn
			FROM checks
		)
		WHERE rn <= ?
	`

	rows, err := db.QueryContext(ctx, query, limitPerMonitor)
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

func CleanupOldChecks(ctx context.Context, db *sql.DB, days int) (int64, error) {
	query := "DELETE FROM checks WHERE checked_at < datetime('now', ?)"
	interval := "-" + strconv.Itoa(days) + " days"
	result, err := db.ExecContext(ctx, query, interval)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}
