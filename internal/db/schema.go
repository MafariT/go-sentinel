package db

import "database/sql"

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

CREATE INDEX IF NOT EXISTS idx_checks_monitor_id ON checks(monitor_id);
CREATE INDEX IF NOT EXISTS idx_checks_checked_at ON checks(checked_at);

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
`

func Initialize(db *sql.DB) error {
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
