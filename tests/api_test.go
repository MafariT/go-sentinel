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

	t.Run("Monitor_Create_Invalid_Interval", func(t *testing.T) {
		m := models.Monitor{Name: "Test", URL: "http://test.com", Interval: 5} // Too short
		body, _ := json.Marshal(m)
		req := httptest.NewRequest("POST", "/monitors", bytes.NewReader(body))
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected 400 for invalid interval, got %d", w.Code)
		}
	})

	t.Run("Monitor_Create_Invalid_URL", func(t *testing.T) {
		m := models.Monitor{Name: "Test", URL: "not-a-valid-url", Interval: 60}
		body, _ := json.Marshal(m)
		req := httptest.NewRequest("POST", "/monitors", bytes.NewReader(body))
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected 400 for invalid URL, got %d", w.Code)
		}
	})

	t.Run("Monitor_Create_Empty_Name", func(t *testing.T) {
		m := models.Monitor{Name: "", URL: "http://test.com", Interval: 60}
		body, _ := json.Marshal(m)
		req := httptest.NewRequest("POST", "/monitors", bytes.NewReader(body))
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected 400 for empty name, got %d", w.Code)
		}
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

	t.Run("Monitor_Create_Max_Interval", func(t *testing.T) {
		m := models.Monitor{Name: "Max Interval Test", URL: "https://example.com", Interval: 86400} // 24 hours
		body, _ := json.Marshal(m)
		req := httptest.NewRequest("POST", "/monitors", bytes.NewReader(body))
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusCreated {
			t.Errorf("Expected 201 for max valid interval, got %d", w.Code)
		}
	})

	t.Run("Monitor_Create_Interval_Too_Large", func(t *testing.T) {
		m := models.Monitor{Name: "Test", URL: "https://example.com", Interval: 86401} // Over 24 hours
		body, _ := json.Marshal(m)
		req := httptest.NewRequest("POST", "/monitors", bytes.NewReader(body))
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected 400 for interval too large, got %d", w.Code)
		}
	})

	t.Run("Monitor_Create_Min_Interval", func(t *testing.T) {
		m := models.Monitor{Name: "Min Interval Test", URL: "https://example.com", Interval: 10}
		body, _ := json.Marshal(m)
		req := httptest.NewRequest("POST", "/monitors", bytes.NewReader(body))
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusCreated {
			t.Errorf("Expected 201 for min valid interval, got %d", w.Code)
		}
	})

	t.Run("Monitor_Create_Name_Too_Long", func(t *testing.T) {
		longName := ""
		for i := 0; i < 201; i++ {
			longName += "a"
		}
		m := models.Monitor{Name: longName, URL: "https://example.com", Interval: 60}
		body, _ := json.Marshal(m)
		req := httptest.NewRequest("POST", "/monitors", bytes.NewReader(body))
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected 400 for name too long, got %d", w.Code)
		}
	})

	t.Run("Monitor_Create_FTP_URL", func(t *testing.T) {
		m := models.Monitor{Name: "FTP Test", URL: "ftp://example.com", Interval: 60}
		body, _ := json.Marshal(m)
		req := httptest.NewRequest("POST", "/monitors", bytes.NewReader(body))
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected 400 for non-http(s) scheme, got %d", w.Code)
		}
	})

	t.Run("Monitor_Create_URL_No_Host", func(t *testing.T) {
		m := models.Monitor{Name: "Test", URL: "http://", Interval: 60}
		body, _ := json.Marshal(m)
		req := httptest.NewRequest("POST", "/monitors", bytes.NewReader(body))
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected 400 for URL without host, got %d", w.Code)
		}
	})

	t.Run("Monitor_Create_Malformed_JSON", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/monitors", bytes.NewReader([]byte("{invalid json")))
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected 400 for malformed JSON, got %d", w.Code)
		}
	})

	t.Run("Monitor_Create_No_Auth", func(t *testing.T) {
		m := models.Monitor{Name: "Test", URL: "http://test.com", Interval: 60}
		body, _ := json.Marshal(m)
		req := httptest.NewRequest("POST", "/monitors", bytes.NewReader(body))
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("Expected 401 for no auth, got %d", w.Code)
		}
	})

	t.Run("Monitor_Create_Empty_Auth", func(t *testing.T) {
		m := models.Monitor{Name: "Test", URL: "http://test.com", Interval: 60}
		body, _ := json.Marshal(m)
		req := httptest.NewRequest("POST", "/monitors", bytes.NewReader(body))
		req.Header.Set("Authorization", "")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("Expected 401 for empty auth, got %d", w.Code)
		}
	})

	var updateMonitorID int64
	t.Run("Monitor_Update_Setup", func(t *testing.T) {
		m := models.Monitor{Name: "Update Test", URL: "http://test.com", Interval: 60}
		body, _ := json.Marshal(m)
		req := httptest.NewRequest("POST", "/monitors", bytes.NewReader(body))
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		var created models.Monitor
		json.NewDecoder(w.Body).Decode(&created)
		updateMonitorID = created.ID
	})

	t.Run("Monitor_Update_Success", func(t *testing.T) {
		m := models.Monitor{ID: updateMonitorID, Name: "Updated Name", URL: "https://updated.com", Interval: 120}
		body, _ := json.Marshal(m)
		req := httptest.NewRequest("PUT", "/monitors", bytes.NewReader(body))
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Errorf("Expected 200 for update, got %d", w.Code)
		}
	})

	t.Run("Monitor_Update_No_ID", func(t *testing.T) {
		m := models.Monitor{Name: "Test", URL: "http://test.com", Interval: 60}
		body, _ := json.Marshal(m)
		req := httptest.NewRequest("PUT", "/monitors", bytes.NewReader(body))
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected 400 for update without ID, got %d", w.Code)
		}
	})

	t.Run("Monitor_Update_Invalid_Data", func(t *testing.T) {
		m := models.Monitor{ID: updateMonitorID, Name: "", URL: "http://test.com", Interval: 60}
		body, _ := json.Marshal(m)
		req := httptest.NewRequest("PUT", "/monitors", bytes.NewReader(body))
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected 400 for invalid update data, got %d", w.Code)
		}
	})

	t.Run("Monitor_Update_No_Auth", func(t *testing.T) {
		m := models.Monitor{ID: updateMonitorID, Name: "Test", URL: "http://test.com", Interval: 60}
		body, _ := json.Marshal(m)
		req := httptest.NewRequest("PUT", "/monitors", bytes.NewReader(body))
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("Expected 401 for update without auth, got %d", w.Code)
		}
	})

	t.Run("Monitor_Delete_Invalid_ID", func(t *testing.T) {
		req := httptest.NewRequest("DELETE", "/monitors/invalid", nil)
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected 400 for invalid ID, got %d", w.Code)
		}
	})

	t.Run("Monitor_Delete_Negative_ID", func(t *testing.T) {
		req := httptest.NewRequest("DELETE", "/monitors/-1", nil)
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusInternalServerError {
			t.Logf("Delete negative ID resulted in %d", w.Code)
		}
	})

	t.Run("Monitor_List_URL_Hidden_For_Non_Admin", func(t *testing.T) {
		// Create a monitor first
		m := models.Monitor{Name: "Privacy Test", URL: "http://secret.com", Interval: 60}
		body, _ := json.Marshal(m)
		req := httptest.NewRequest("POST", "/monitors", bytes.NewReader(body))
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)

		req = httptest.NewRequest("GET", "/monitors", nil)
		w = httptest.NewRecorder()
		s.ServeHTTP(w, req)

		var monitors []models.Monitor
		json.NewDecoder(w.Body).Decode(&monitors)

		if len(monitors) > 0 {
			for _, mon := range monitors {
				if mon.URL != "" {
					t.Errorf("Expected URL to be hidden for non-admin, got %s", mon.URL)
				}
			}
		}
	})

	t.Run("Monitor_List_URL_Visible_For_Admin", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/monitors", nil)
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)

		var monitors []models.Monitor
		json.NewDecoder(w.Body).Decode(&monitors)

		if len(monitors) > 0 {
			foundURL := false
			for _, mon := range monitors {
				if mon.URL != "" {
					foundURL = true
					break
				}
			}
			if !foundURL {
				t.Error("Expected URL to be visible for admin")
			}
		}
	})

	t.Run("Checks_With_Custom_Limit", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/checks?limit=10", nil)
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", w.Code)
		}
	})

	t.Run("Checks_With_Max_Limit", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/checks?limit=100", nil)
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", w.Code)
		}
	})

	t.Run("Checks_With_Excessive_Limit", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/checks?limit=1000", nil)
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Errorf("Expected 200 (should cap at 100), got %d", w.Code)
		}
	})

	t.Run("Checks_With_Invalid_Limit", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/checks?limit=abc", nil)
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Errorf("Expected 200 (should use default), got %d", w.Code)
		}
	})

	t.Run("Checks_With_Zero_Limit", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/checks?limit=0", nil)
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Errorf("Expected 200 (should use minimum 1), got %d", w.Code)
		}
	})

	t.Run("History_All_Monitors", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/history", nil)
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", w.Code)
		}
	})

	t.Run("History_Invalid_Monitor_ID", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/history/invalid", nil)
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected 400 for invalid monitor ID, got %d", w.Code)
		}
	})

	t.Run("History_Nonexistent_Monitor", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/history/99999", nil)
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Errorf("Expected 200 (empty array), got %d", w.Code)
		}
	})

	t.Run("Incident_Create_No_Auth", func(t *testing.T) {
		inc := models.Incident{Title: "Test", Description: "Test", Status: "investigating"}
		body, _ := json.Marshal(inc)
		req := httptest.NewRequest("POST", "/incidents", bytes.NewReader(body))
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("Expected 401, got %d", w.Code)
		}
	})

	t.Run("Incident_Create_Malformed_JSON", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/incidents", bytes.NewReader([]byte("{bad")))
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected 400, got %d", w.Code)
		}
	})

	t.Run("Incident_Delete_Invalid_ID", func(t *testing.T) {
		req := httptest.NewRequest("DELETE", "/incidents/invalid", nil)
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected 400, got %d", w.Code)
		}
	})

	t.Run("Incident_Delete_No_Auth", func(t *testing.T) {
		req := httptest.NewRequest("DELETE", "/incidents/1", nil)
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("Expected 401, got %d", w.Code)
		}
	})

	t.Run("Security_SQL_Injection_Monitor_Name", func(t *testing.T) {
		m := models.Monitor{Name: "'; DROP TABLE monitors; --", URL: "http://test.com", Interval: 60}
		body, _ := json.Marshal(m)
		req := httptest.NewRequest("POST", "/monitors", bytes.NewReader(body))
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusCreated {
			t.Errorf("Expected 201 (SQL injection should be prevented), got %d", w.Code)
		}

		req = httptest.NewRequest("GET", "/monitors", nil)
		w = httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Error("Monitors table appears to be affected by SQL injection")
		}
	})

	t.Run("Security_XSS_Monitor_Name", func(t *testing.T) {
		m := models.Monitor{Name: "<script>alert('xss')</script>", URL: "http://test.com", Interval: 60}
		body, _ := json.Marshal(m)
		req := httptest.NewRequest("POST", "/monitors", bytes.NewReader(body))
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusCreated {
			t.Errorf("Expected 201, got %d", w.Code)
		}
	})

	t.Run("Monitor_Create_Max_Valid_Name", func(t *testing.T) {
		maxName := ""
		for i := 0; i < 200; i++ {
			maxName += "a"
		}
		m := models.Monitor{Name: maxName, URL: "http://test.com", Interval: 60}
		body, _ := json.Marshal(m)
		req := httptest.NewRequest("POST", "/monitors", bytes.NewReader(body))
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusCreated {
			t.Errorf("Expected 201 for 200 char name, got %d", w.Code)
		}
	})

	t.Run("Monitor_Create_HTTPS", func(t *testing.T) {
		m := models.Monitor{Name: "HTTPS Test", URL: "https://secure.com", Interval: 60}
		body, _ := json.Marshal(m)
		req := httptest.NewRequest("POST", "/monitors", bytes.NewReader(body))
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusCreated {
			t.Errorf("Expected 201 for HTTPS URL, got %d", w.Code)
		}
	})

	t.Run("Monitor_Create_URL_With_Path", func(t *testing.T) {
		m := models.Monitor{Name: "Path Test", URL: "https://example.com/api/health", Interval: 60}
		body, _ := json.Marshal(m)
		req := httptest.NewRequest("POST", "/monitors", bytes.NewReader(body))
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusCreated {
			t.Errorf("Expected 201 for URL with path, got %d", w.Code)
		}
	})

	t.Run("Monitor_Create_URL_With_Port", func(t *testing.T) {
		m := models.Monitor{Name: "Port Test", URL: "http://localhost:8080", Interval: 60}
		body, _ := json.Marshal(m)
		req := httptest.NewRequest("POST", "/monitors", bytes.NewReader(body))
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusCreated {
			t.Errorf("Expected 201 for URL with port, got %d", w.Code)
		}
	})

	t.Run("Health_Check_Success", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/health", nil)
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", w.Code)
		}
		var resp map[string]interface{}
		json.NewDecoder(w.Body).Decode(&resp)
		if resp["status"] != "ok" {
			t.Errorf("Expected status ok, got %v", resp["status"])
		}
		if resp["database"] != "ok" {
			t.Errorf("Expected database ok, got %v", resp["database"])
		}
	})

	t.Run("RequestSizeLimit_ExceedsLimit", func(t *testing.T) {
		largePayload := make([]byte, (1<<20)+1)
		for i := range largePayload {
			largePayload[i] = 'A'
		}
		req := httptest.NewRequest("POST", "/monitors", bytes.NewReader(largePayload))
		req.Header.Set("Authorization", "secret")
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest && w.Code != http.StatusRequestEntityTooLarge {
			t.Errorf("Expected 400 or 413 for oversized request, got %d", w.Code)
		}
	})

	t.Run("RequestSizeLimit_WithinLimit", func(t *testing.T) {
		m := models.Monitor{Name: "Size Test", URL: "http://test.com", Interval: 60}
		body, _ := json.Marshal(m)
		req := httptest.NewRequest("POST", "/monitors", bytes.NewReader(body))
		req.Header.Set("Authorization", "secret")
		w := httptest.NewRecorder()
		s.ServeHTTP(w, req)
		if w.Code != http.StatusCreated {
			t.Errorf("Expected 201 for normal sized request, got %d", w.Code)
		}
	})
}
