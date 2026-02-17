package db

import (
	"context"
	"database/sql"
	"go-sentinel/internal/models"
)

func CreateIncident(ctx context.Context, db *sql.DB, incident models.Incident) (int64, error) {
	query := "INSERT INTO incidents (title, description, status) VALUES (?, ?, ?)"
	result, err := db.ExecContext(ctx, query, incident.Title, incident.Description, incident.Status)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func GetIncidents(ctx context.Context, db *sql.DB) ([]models.Incident, error) {
	query := "SELECT id, title, description, status, created_at FROM incidents ORDER BY created_at DESC LIMIT 10"
	rows, err := db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var incidents []models.Incident
	for rows.Next() {
		var i models.Incident
		if err := rows.Scan(&i.ID, &i.Title, &i.Description, &i.Status, &i.CreatedAt); err != nil {
			return nil, err
		}
		incidents = append(incidents, i)
	}
	return incidents, nil
}

func DeleteIncident(ctx context.Context, db *sql.DB, id int64) error {
	_, err := db.ExecContext(ctx, "DELETE FROM incidents WHERE id = ?", id)
	return err
}
