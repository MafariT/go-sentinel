package main

import (
	"context"
	"database/sql"
	"embed"
	"io/fs"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

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

	database.SetMaxOpenConns(1)
	database.SetMaxIdleConns(1)
	database.SetConnMaxLifetime(0)

	if err := db.Initialize(database); err != nil {
		database.Close()
		log.Fatalf("Failed to initialize database schema: %v", err)
	}

	// Services & Server Initialization
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan, os.Interrupt, syscall.SIGTERM)

	monitor.StartWorker(ctx, database)

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

	go server.Start(ctx, port)

	<-signalChan
	log.Println("Received interrupt signal, shutting down...")
	cancel()

	time.Sleep(3 * time.Second)

	database.Close()
	log.Println("Shutdown complete")
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
