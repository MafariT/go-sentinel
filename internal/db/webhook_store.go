package db

import (
	"context"
	"database/sql"
	"go-sentinel/internal/models"
)

func CreateWebhook(ctx context.Context, db *sql.DB, wh models.Webhook) (int64, error) {
	result, err := db.ExecContext(ctx,
		"INSERT INTO webhooks (name, url, enabled) VALUES (?, ?, ?)",
		wh.Name, wh.URL, wh.Enabled,
	)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func GetWebhooks(ctx context.Context, db *sql.DB) ([]models.Webhook, error) {
	rows, err := db.QueryContext(ctx,
		"SELECT id, name, url, enabled FROM webhooks ORDER BY id ASC",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	webhooks := []models.Webhook{}
	for rows.Next() {
		var wh models.Webhook
		var enabled int
		if err := rows.Scan(&wh.ID, &wh.Name, &wh.URL, &enabled); err != nil {
			return nil, err
		}
		wh.Enabled = enabled == 1
		webhooks = append(webhooks, wh)
	}
	return webhooks, nil
}

func GetEnabledWebhooks(ctx context.Context, db *sql.DB) ([]models.Webhook, error) {
	rows, err := db.QueryContext(ctx,
		"SELECT id, name, url, enabled FROM webhooks WHERE enabled = 1 ORDER BY id ASC",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	webhooks := []models.Webhook{}
	for rows.Next() {
		var wh models.Webhook
		var enabled int
		if err := rows.Scan(&wh.ID, &wh.Name, &wh.URL, &enabled); err != nil {
			return nil, err
		}
		wh.Enabled = enabled == 1
		webhooks = append(webhooks, wh)
	}
	return webhooks, nil
}

func UpdateWebhook(ctx context.Context, db *sql.DB, id int64, name, url string, enabled bool) error {
	enabledInt := 0
	if enabled {
		enabledInt = 1
	}
	_, err := db.ExecContext(ctx,
		"UPDATE webhooks SET name = ?, url = ?, enabled = ? WHERE id = ?",
		name, url, enabledInt, id,
	)
	return err
}

func DeleteWebhook(ctx context.Context, db *sql.DB, id int64) error {
	_, err := db.ExecContext(ctx, "DELETE FROM webhooks WHERE id = ?", id)
	return err
}
