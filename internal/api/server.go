package api

import (
	"crypto/sha256"
	"crypto/subtle"
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

func (s *Server) isAdmin(r *http.Request) bool {
	if s.AdminToken == "" {
		return false
	}
	receivedToken := r.Header.Get("Authorization")

	actualHash := sha256.Sum256([]byte(s.AdminToken))
	receivedHash := sha256.Sum256([]byte(receivedToken))

	return subtle.ConstantTimeCompare(actualHash[:], receivedHash[:]) == 1
}

func (s *Server) adminOnly(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !s.isAdmin(r) {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		next(w, r)
	}
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

func (s *Server) securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		next.ServeHTTP(w, r)
	})
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.securityHeaders(s.mux).ServeHTTP(w, r)
}

func (s *Server) Start(port string) {
	log.Printf("API Server running on port %s", port)
	if err := http.ListenAndServe(":"+port, s); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
