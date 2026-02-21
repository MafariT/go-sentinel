package notifier

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"go-sentinel/internal/db"
	"go-sentinel/internal/models"
	"log"
	"net/http"
	"time"
)

const (
	colorRed   = 0xE74C3C
	colorGreen = 0x2ECC71
)

type discordEmbed struct {
	Title       string       `json:"title"`
	Description string       `json:"description"`
	Color       int          `json:"color"`
	Fields      []embedField `json:"fields"`
	Footer      *embedFooter `json:"footer,omitempty"`
	Timestamp   string       `json:"timestamp"`
}

type embedField struct {
	Name   string `json:"name"`
	Value  string `json:"value"`
	Inline bool   `json:"inline"`
}

type embedFooter struct {
	Text string `json:"text"`
}

type discordPayload struct {
	Embeds []discordEmbed `json:"embeds"`
}

var httpClient = &http.Client{Timeout: 10 * time.Second}

func NotifyStateChange(ctx context.Context, database *sql.DB, monitor models.Monitor, result models.Check) {
	webhooks, err := db.GetEnabledWebhooks(ctx, database)
	if err != nil {
		log.Printf("Notifier: failed to fetch webhooks: %v", err)
		return
	}
	if len(webhooks) == 0 {
		return
	}

	embed := buildEmbed(monitor, result)
	payload, err := json.Marshal(discordPayload{Embeds: []discordEmbed{embed}})
	if err != nil {
		log.Printf("Notifier: failed to marshal payload: %v", err)
		return
	}

	for _, wh := range webhooks {
		go func(url string) {
			req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(payload))
			if err != nil {
				log.Printf("Notifier: failed to create request for webhook: %v", err)
				return
			}
			req.Header.Set("Content-Type", "application/json")

			resp, err := httpClient.Do(req)
			if err != nil {
				log.Printf("Notifier: failed to send webhook: %v", err)
				return
			}
			defer resp.Body.Close()

			if resp.StatusCode < 200 || resp.StatusCode >= 300 {
				log.Printf("Notifier: webhook returned non-2xx status: %d", resp.StatusCode)
			}
		}(wh.URL)
	}
}

func buildEmbed(monitor models.Monitor, result models.Check) discordEmbed {
	var title, description string
	var color int

	if result.IsUp {
		title = fmt.Sprintf("✅ Monitor Recovered: %s", monitor.Name)
		description = fmt.Sprintf("**%s** is back online and responding normally.", monitor.Name)
		color = colorGreen
	} else {
		title = fmt.Sprintf("🔴 Monitor Down: %s", monitor.Name)
		description = fmt.Sprintf("**%s** is not responding. Immediate attention may be required.", monitor.Name)
		color = colorRed
	}

	statusValue := httpStatusText(result.StatusCode)

	intervalText := fmt.Sprintf("Every %ds", monitor.Interval)
	if monitor.Interval%60 == 0 {
		intervalText = fmt.Sprintf("Every %dm", monitor.Interval/60)
	}

	return discordEmbed{
		Title:       title,
		Description: description,
		Color:       color,
		Fields: []embedField{
			{Name: "URL", Value: monitor.URL, Inline: false},
			{Name: "Status Code", Value: statusValue, Inline: true},
			{Name: "Latency", Value: fmt.Sprintf("%dms", result.Latency), Inline: true},
			{Name: "Interval", Value: intervalText, Inline: true},
		},
		Footer:    &embedFooter{Text: "go-sentinel"},
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}
}

func httpStatusText(code int) string {
	if code <= 0 {
		return "N/A — Connection failed"
	}
	text := http.StatusText(code)
	if text == "" {
		return fmt.Sprintf("%d", code)
	}
	return fmt.Sprintf("%d %s", code, text)
}
