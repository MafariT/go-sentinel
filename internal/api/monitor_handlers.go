package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"go-sentinel/internal/db"
	"go-sentinel/internal/models"
)

func (s *Server) handleGetMonitors(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	monitors, err := db.GetMonitors(ctx, s.DB)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	if !s.isAdmin(r) {
		for i := range monitors {
			monitors[i].URL = ""
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(monitors)
}

func (s *Server) handlePostMonitor(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var m models.Monitor
	if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := m.Validate(); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	id, err := db.CreateMonitor(ctx, s.DB, m)
	if err != nil {
		http.Error(w, "Failed to create monitor", http.StatusInternalServerError)
		return
	}

	m.ID = id
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(m)
}

func (s *Server) handlePutMonitor(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var m models.Monitor
	if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if m.ID == 0 {
		http.Error(w, "Monitor ID required", http.StatusBadRequest)
		return
	}

	if err := m.Validate(); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := db.UpdateMonitor(ctx, s.DB, m); err != nil {
		http.Error(w, "Failed to update monitor", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(m)
}

func (s *Server) handleDeleteMonitor(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	idStr := r.PathValue("id")
	if idStr == "" {
		http.Error(w, "Missing id parameter", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid id parameter", http.StatusBadRequest)
		return
	}

	if err := db.DeleteMonitor(ctx, s.DB, id); err != nil {
		http.Error(w, "Failed to delete monitor", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) handleHistory(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	idStr := r.PathValue("id")
	if idStr == "" {
		http.Error(w, "Missing monitor_id", http.StatusBadRequest)
		return
	}

	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid monitor_id", http.StatusBadRequest)
		return
	}

	stats, err := db.GetMonitorHistory(ctx, s.DB, id)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

func (s *Server) handleAllHistory(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	stats, err := db.GetAllMonitorHistory(ctx, s.DB)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}
