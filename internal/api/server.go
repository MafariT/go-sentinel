package api

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	"go-sentinel/internal/db"
	"go-sentinel/internal/models"
)

type Server struct {
	DB *sql.DB
}

func (s *Server) Start(port string) {
	http.HandleFunc("/monitors", s.handleMonitors)

	log.Printf("API Server running on http://localhost:%s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

func (s *Server) handleMonitors(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		s.handleGetMonitors(w, r)
	case http.MethodPost:
		s.handlePostMonitor(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func (s *Server) handleGetMonitors(w http.ResponseWriter, r *http.Request) {
	monitors, err := db.GetMonitors(s.DB)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(monitors)
}

func (s *Server) handlePostMonitor(w http.ResponseWriter, r *http.Request) {
	var m models.Monitor
	if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	id, err := db.CreateMonitor(s.DB, m)
	if err != nil {
		http.Error(w, "Failed to create monitor", http.StatusInternalServerError)
		return
	}

	m.ID = id
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(m)
}
