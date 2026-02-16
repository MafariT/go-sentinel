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
	"github.com/joho/godotenv"
)

//go:embed web/dist/*
var frontend embed.FS
var Version = "dev"

func main() {
	log.Printf("Go-Sentinel %s starting...", Version)

	if err := godotenv.Load(); err != nil {
		log.Println("Note: .env file not found, using system environment variables")
	}

	// Configuration
	var (
		dbPath     = getEnv("DB_PATH", "monitor.db")
		port       = getEnv("PORT", "8088")
		adminToken = os.Getenv("ADMIN_TOKEN")
	)

	// Database Setup
	database, err := sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer database.Close()

	if err := db.Initialize(database); err != nil {
		log.Fatalf("Failed to initialize database schema: %v", err)
	}

	// Services & Server Initialization
	monitor.StartWorker(database)

	server := api.NewServer(database, Version)
	server.AdminToken = adminToken

	if server.AdminToken == "" {
		log.Println("WARNING: ADMIN_TOKEN is not set. Admin features are disabled (Read-only mode).")
	} else {
		log.Println("Admin mode enabled.")
	}

	// Frontend Registration
	if distFS, err := fs.Sub(frontend, "web/dist"); err == nil {
		server.RegisterFrontend(distFS)
	} else {
		log.Printf("Warning: Failed to locate embedded frontend: %v", err)
	}

	server.Start(port)
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
