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
	s.mux.HandleFunc("GET /monitors", s.handleGetMonitors)
	s.mux.HandleFunc("POST /monitors", s.adminOnly(s.handlePostMonitor))
	s.mux.HandleFunc("PUT /monitors", s.adminOnly(s.handlePutMonitor))
	s.mux.HandleFunc("DELETE /monitors/{id}", s.adminOnly(s.handleDeleteMonitor))

	s.mux.HandleFunc("GET /checks", s.handleChecks)
	s.mux.HandleFunc("GET /version", s.handleVersion)
	s.mux.HandleFunc("POST /verify-token", s.handleVerifyToken)
	s.mux.HandleFunc("GET /history", s.handleAllHistory)
	s.mux.HandleFunc("GET /history/{id}", s.handleHistory)

	s.mux.HandleFunc("GET /incidents", s.handleGetIncidents)
	s.mux.HandleFunc("POST /incidents", s.adminOnly(s.handlePostIncident))
	s.mux.HandleFunc("DELETE /incidents/{id}", s.adminOnly(s.handleDeleteIncident))
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
