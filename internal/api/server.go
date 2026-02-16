package api

import (
	"database/sql"
	"io/fs"
	"log"
	"net/http"
)

type Server struct {
	DB         *sql.DB
	mux        *http.ServeMux
	AdminToken string
	Version    string
}

func NewServer(database *sql.DB, version string) *Server {
	s := &Server{
		DB:      database,
		mux:     http.NewServeMux(),
		Version: version,
	}
	s.registerRoutes()
	return s
}

func (s *Server) registerRoutes() {
	s.mux.HandleFunc("/monitors", s.handleMonitors)
	s.mux.HandleFunc("/checks", s.handleChecks)
	s.mux.HandleFunc("/version", s.handleVersion)
	s.mux.HandleFunc("/verify-token", s.handleVerifyToken)
	s.mux.HandleFunc("/history", s.handleHistory)
	s.mux.HandleFunc("/incidents", s.handleIncidents)
}

func (s *Server) RegisterFrontend(staticFS fs.FS) {
	fileServer := http.FileServer(http.FS(staticFS))
	s.mux.Handle("/", fileServer)
}

func (s *Server) Start(port string) {
	log.Printf("API Server running on port %s", port)
	if err := http.ListenAndServe(":"+port, s.mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
