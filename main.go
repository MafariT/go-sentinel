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
var Version = "dev"

func main() {
	log.Printf("Go-Sentinel %s starting...", Version)

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

	server := api.NewServer(database, Version)
	server.AdminToken = os.Getenv("ADMIN_TOKEN")

	distFS, err := fs.Sub(frontend, "web/dist")
	if err != nil {
		log.Fatal(err)
	}
	server.RegisterFrontend(distFS)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8088"
	}
	server.Start(port)
}
