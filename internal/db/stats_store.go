package db

import (
	"context"
	"database/sql"
	"go-sentinel/internal/models"
);

func GetMonitorHistory(ctx context.Context, db *sql.DB, monitorID int64) ([]models.DailyStat, error) {
	query := `
		SELECT date, up_count, total_count, total_latency
		FROM daily_stats
		WHERE monitor_id = ?
		ORDER BY date DESC
		LIMIT 30
	`
	rows, err := db.QueryContext(ctx, query, monitorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stats []models.DailyStat
	for rows.Next() {
		var date string
		var up, total, lat int64
		if err := rows.Scan(&date, &up, &total, &lat); err != nil {
			return nil, err
		}
		
		pct := 0.0
		if total > 0 {
			pct = (float64(up) / float64(total)) * 100
		}
		
		avg := int64(0)
		if total > 0 {
			avg = lat / total
		}

		stats = append(stats, models.DailyStat{
			MonitorID:  monitorID,
			Date:       date,
			UptimePct:  pct,
			AvgLatency: avg,
		})
	}
	return stats, nil
}

func GetAllMonitorHistory(ctx context.Context, db *sql.DB) (map[int64][]models.DailyStat, error) {
	query := `
		SELECT monitor_id, date, up_count, total_count, total_latency
		FROM daily_stats
		WHERE date >= date('now', '-30 days')
		ORDER BY monitor_id, date DESC
	`
	rows, err := db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	grouped := make(map[int64][]models.DailyStat)
	for rows.Next() {
		var monitorID int64
		var date string
		var up, total, lat int64
		if err := rows.Scan(&monitorID, &date, &up, &total, &lat); err != nil {
			return nil, err
		}

		pct := 0.0
		if total > 0 {
			pct = (float64(up) / float64(total)) * 100
		}
		
		avg := int64(0)
		if total > 0 {
			avg = lat / total
		}

		grouped[monitorID] = append(grouped[monitorID], models.DailyStat{
			MonitorID:  monitorID,
			Date:       date,
			UptimePct:  pct,
			AvgLatency: avg,
		})
	}
	return grouped, nil
}
