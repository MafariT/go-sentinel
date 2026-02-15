package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"go-sentinel/internal/db"
	"go-sentinel/internal/models"
)

func (s *Server) handleMonitors(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		s.handleGetMonitors(w, r)
	case http.MethodPost:
		s.handlePostMonitor(w, r)
	case http.MethodDelete:
		s.handleDeleteMonitor(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func (s *Server) handleDeleteMonitor(w http.ResponseWriter, r *http.Request) {
	if s.AdminToken != "" && r.Header.Get("Authorization") != s.AdminToken {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "Missing id parameter", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid id parameter", http.StatusBadRequest)
		return
	}

	if err := db.DeleteMonitor(s.DB, id); err != nil {
		http.Error(w, "Failed to delete monitor", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
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
	if s.AdminToken != "" && r.Header.Get("Authorization") != s.AdminToken {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

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

func (s *Server) handleChecks(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	limitStr := r.URL.Query().Get("limit")
	limit := 50
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil {
			limit = l
		}
	}

	checksMap, err := db.GetChecks(s.DB, limit)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(checksMap)
}

func (s *Server) handleVersion(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"version": s.Version})
}

func (s *Server) handleHistory(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("monitor_id")
	if idStr == "" {
		http.Error(w, "Missing monitor_id", http.StatusBadRequest)
		return
	}
	
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid monitor_id", http.StatusBadRequest)
		return
	}

	stats, err := db.GetMonitorHistory(s.DB, id)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

func (s *Server) handleIncidents(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		incidents, err := db.GetIncidents(s.DB)
		if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(incidents)
		return
	}

	if s.AdminToken != "" && r.Header.Get("Authorization") != s.AdminToken {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if r.Method == http.MethodPost {
		var i models.Incident
		if err := json.NewDecoder(r.Body).Decode(&i); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		id, err := db.CreateIncident(s.DB, i)
		if err != nil {
			http.Error(w, "Failed to create incident", http.StatusInternalServerError)
			return
		}
		i.ID = id
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(i)
		return
	}

	if r.Method == http.MethodDelete {
		idStr := r.URL.Query().Get("id")
		if idStr == "" {
			http.Error(w, "Missing id parameter", http.StatusBadRequest)
			return
		}
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			http.Error(w, "Invalid id parameter", http.StatusBadRequest)
			return
		}

		if err := db.DeleteIncident(s.DB, id); err != nil {
			http.Error(w, "Failed to delete incident", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)
		return
	}

	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
}
