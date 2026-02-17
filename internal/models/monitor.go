package models

import (
	"errors"
	"net/url"
	"time"
)

type Monitor struct {
	ID            int64      `json:"id"`
	Name          string     `json:"name"`
	URL           string     `json:"url"`
	Interval      int        `json:"interval"`
	LastCheckedAt *time.Time `json:"last_checked_at,omitempty"`
}

func (m *Monitor) Validate() error {
	if len(m.Name) < 1 || len(m.Name) > 200 {
		return errors.New("name must be between 1-200 characters")
	}
	
	if m.Interval < 10 || m.Interval > 86400 {
		return errors.New("interval must be between 10-86400 seconds (10s to 24h)")
	}
	
	parsedURL, err := url.Parse(m.URL)
	if err != nil {
		return errors.New("invalid URL format")
	}
	
	if parsedURL.Scheme != "http" && parsedURL.Scheme != "https" {
		return errors.New("URL must use http or https scheme")
	}
	
	if parsedURL.Host == "" {
		return errors.New("URL must have a valid host")
	}
	
	return nil
}


