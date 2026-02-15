package api

import (
	"database/sql"
	"log"
	"net/http"
)

type Server struct {
	DB  *sql.DB
	mux *http.ServeMux
}

func NewServer(database *sql.DB) *Server {
	s := &Server{
		DB:  database,
		mux: http.NewServeMux(),
	}
	s.registerRoutes()
	return s
}

func (s *Server) registerRoutes() {
	s.mux.HandleFunc("/monitors", s.handleMonitors)
	s.mux.HandleFunc("/checks", s.handleChecks)
}

func (s *Server) Start(port string) {
	log.Printf("API Server running on http://localhost:%s", port)
	if err := http.ListenAndServe(":"+port, s.mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
