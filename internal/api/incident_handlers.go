package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"go-sentinel/internal/db"
	"go-sentinel/internal/models"
)

func (s *Server) handleGetIncidents(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	incidents, err := db.GetIncidents(ctx, s.DB)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(incidents)
}

func (s *Server) handlePostIncident(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var i models.Incident
	if err := json.NewDecoder(r.Body).Decode(&i); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	id, err := db.CreateIncident(ctx, s.DB, i)
	if err != nil {
		http.Error(w, "Failed to create incident", http.StatusInternalServerError)
		return
	}
	i.ID = id
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(i)
}

func (s *Server) handleDeleteIncident(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	idStr := r.PathValue("id")
	if idStr == "" {
		http.Error(w, "Missing id parameter", http.StatusBadRequest)
		return
	}
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid id parameter", http.StatusBadRequest)
		return
	}

	if err := db.DeleteIncident(ctx, s.DB, id); err != nil {
		http.Error(w, "Failed to delete incident", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
