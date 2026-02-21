package db

import (
	"database/sql"
	"fmt"
)

var pragmas = []string{
	"PRAGMA journal_mode=WAL",
	"PRAGMA synchronous=NORMAL",
	"PRAGMA cache_size=-64000",
	"PRAGMA temp_store=memory",
	"PRAGMA foreign_keys=ON",
}

const schema = `
CREATE TABLE IF NOT EXISTS monitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    interval INTEGER DEFAULT 60,
    last_checked_at TIMESTAMP,
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


CREATE TABLE IF NOT EXISTS daily_stats (
    monitor_id INTEGER,
    date DATE,
    up_count INTEGER DEFAULT 0,
    total_count INTEGER DEFAULT 0,
    total_latency INTEGER DEFAULT 0,
    PRIMARY KEY (monitor_id, date),
    FOREIGN KEY (monitor_id) REFERENCES monitors (id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
    status TEXT NOT NULL, -- 'investigating', 'monitoring', 'resolved'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS webhooks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_checks_monitor_id ON checks(monitor_id);
CREATE INDEX IF NOT EXISTS idx_checks_checked_at ON checks(checked_at);
CREATE INDEX IF NOT EXISTS idx_checks_monitor_checked ON checks(monitor_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhooks_enabled ON webhooks(enabled);
`

func Initialize(db *sql.DB) error {
	for _, p := range pragmas {
		if _, err := db.Exec(p); err != nil {
			return fmt.Errorf("failed to set %s: %w", p, err)
		}
	}
	_, err := db.Exec(schema)
	return err
}

func InitializeInMem() (*sql.DB, error) {
	db, err := sql.Open("sqlite", ":memory:")
	if err != nil {
		return nil, err
	}
	if err := Initialize(db); err != nil {
		return nil, err
	}
	return db, nil
}
