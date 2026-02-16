package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"go-sentinel/internal/api"
	"go-sentinel/internal/db"
	"go-sentinel/internal/models"

	_ "github.com/glebarez/go-sqlite"
)

func TestAPI(t *testing.T) {
	dbConn, err := db.InitializeInMem()
	if err != nil {
		t.Fatalf("Failed to init in-mem db: %v", err)
	}
	defer dbConn.Close()
	
	s := api.NewServer(dbConn, "1.0.0")
	s.AdminToken = "secret"

	// --- AUTH TESTS ---
	t.Run("Auth_VerifyToken_Success", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/verify-token", nil)
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", w.Code)
		}
	})

	t.Run("Auth_VerifyToken_Failure", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/verify-token", nil)
		req.Header.Set("Authorization", "wrong")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("Expected 401, got %d", w.Code)
		}
	})

	// --- SYSTEM TESTS ---
	t.Run("System_Version", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/version", nil)
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", w.Code)
		}
		var resp map[string]string
		json.NewDecoder(w.Body).Decode(&resp)
		if resp["version"] != "1.0.0" {
			t.Errorf("Expected version 1.0.0, got %s", resp["version"])
		}
	})

	t.Run("System_Checks", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/checks", nil)
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", w.Code)
		}
	})

	// --- MONITOR TESTS ---
	var monitorID int64
	t.Run("Monitor_Create", func(t *testing.T) {
		m := models.Monitor{Name: "Test", URL: "http://test.com", Interval: 60}
		body, _ := json.Marshal(m)
		req := httptest.NewRequest("POST", "/monitors", bytes.NewReader(body))
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusCreated {
			t.Fatalf("Expected 201, got %d", w.Code)
		}
		var created models.Monitor
		json.NewDecoder(w.Body).Decode(&created)
		monitorID = created.ID
	})

	t.Run("Monitor_List", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/monitors", nil)
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", w.Code)
		}
	})

	t.Run("Monitor_History", func(t *testing.T) {
		url := fmt.Sprintf("/history/%d", monitorID)
		req := httptest.NewRequest("GET", url, nil)
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", w.Code)
		}
	})

	// --- INCIDENT TESTS ---
	var incidentID int64
	t.Run("Incident_Create", func(t *testing.T) {
		inc := models.Incident{Title: "Outage", Description: "Down", Status: "investigating"}
		body, _ := json.Marshal(inc)
		req := httptest.NewRequest("POST", "/incidents", bytes.NewReader(body))
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("Expected 200, got %d", w.Code)
		}
		var created models.Incident
		json.NewDecoder(w.Body).Decode(&created)
		incidentID = created.ID
	})

	t.Run("Incident_List", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/incidents", nil)
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", w.Code)
		}
	})

	t.Run("Incident_Delete", func(t *testing.T) {
		url := fmt.Sprintf("/incidents/%d", incidentID)
		req := httptest.NewRequest("DELETE", url, nil)
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusNoContent {
			t.Errorf("Expected 204, got %d", w.Code)
		}
	})

	t.Run("Monitor_Delete_Unauthorized", func(t *testing.T) {
		url := fmt.Sprintf("/monitors/%d", monitorID)
		req := httptest.NewRequest("DELETE", url, nil)
		req.Header.Set("Authorization", "wrong-token")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("Expected 401, got %d", w.Code)
		}
	})

	t.Run("Monitor_Delete", func(t *testing.T) {
		url := fmt.Sprintf("/monitors/%d", monitorID)
		req := httptest.NewRequest("DELETE", url, nil)
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusNoContent {
			t.Errorf("Expected 204, got %d", w.Code)
		}
	})
}
