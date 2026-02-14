package main

import (
	"database/sql"
	"fmt"
	"log"

	"go-sentinel/internal/db"
	"go-sentinel/internal/models"

	_ "github.com/glebarez/go-sqlite"
)

func main() {
	fmt.Println("Go-Sentinel Starting...")

	database, err := sql.Open("sqlite", "monitor.db")
	if err != nil {
		log.Fatal(err)
	}
	defer database.Close()
	
	if err := db.Initialize(database); err != nil {
		log.Fatal(err)
	}

	if _, err := db.CreateMonitor(database, models.Monitor{
		Name: "Google",
		URL: "https://google.com",
		Interval: 60,
	}); err != nil {
		log.Fatal(err)
	}
}