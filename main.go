package main

import (
	"database/sql"
	"log"

	"go-sentinel/internal/api"
	"go-sentinel/internal/db"
	"go-sentinel/internal/service/monitor"

	_ "github.com/glebarez/go-sqlite"
)

func main() {
	database, err := sql.Open("sqlite", "monitor.db")
	if err != nil {
		log.Fatal(err)
	}
	defer database.Close()

	if err := db.Initialize(database); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	monitor.StartWorker(database)

	server := api.NewServer(database)
	server.Start("8080")
}
