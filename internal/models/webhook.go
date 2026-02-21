package models

import "errors"

type Webhook struct {
	ID      int64  `json:"id"`
	Name    string `json:"name"`
	URL     string `json:"url"`
	Enabled bool   `json:"enabled"`
}

func (w *Webhook) Validate() error {
	if len(w.Name) < 1 || len(w.Name) > 200 {
		return errors.New("name must be between 1-200 characters")
	}
	if len(w.URL) < 1 || len(w.URL) > 2048 {
		return errors.New("URL must be between 1-2048 characters")
	}
	return nil
}
