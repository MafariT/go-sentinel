package main

import (
	"database/sql"
	"embed"
	"io/fs"
	"log"
	"os"

	"go-sentinel/internal/api"
	"go-sentinel/internal/db"
	"go-sentinel/internal/service/monitor"

	_ "github.com/glebarez/go-sqlite"
)

//go:embed web/dist/*
var frontend embed.FS

func main() {
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "monitor.db"
	}

	database, err := sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatal(err)
	}
	defer database.Close()

	if err := db.Initialize(database); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	monitor.StartWorker(database)

	server := api.NewServer(database)
	server.AdminToken = os.Getenv("ADMIN_TOKEN")

	distFS, err := fs.Sub(frontend, "web/dist")
	if err != nil {
		log.Fatal(err)
	}
	server.RegisterFrontend(distFS)

	server.Start("8088")
}
