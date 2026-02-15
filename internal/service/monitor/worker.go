package monitor

import (
	"database/sql"
	"go-sentinel/internal/db"
	"go-sentinel/internal/models"
	"go-sentinel/internal/service/checker"
	"log"
	"time"
)

func StartWorker(database *sql.DB) {
	ticker := time.NewTicker(1 * time.Second)

	go func() {
		for range ticker.C {
			targets, err := db.GetMonitors(database)
			if err != nil {
				log.Printf("Worker error: failed to fetch monitors: %v", err)
				continue
			}

			for _, target := range targets {
				if isDue(target) {
					if err := db.UpdateLastChecked(database, target.ID); err != nil {
						log.Printf("Worker error: failed to update timestamp: %v", err)
						continue
					}

					go func(t models.Monitor) {
						result := checker.PerformHTTPCheck(t.URL)

						err := db.SaveCheck(database, models.Check{
							MonitorID:  t.ID,
							StatusCode: result.StatusCode,
							Latency:    result.Latency,
							IsUp:       result.IsUp,
						})
						if err != nil {
							log.Printf("Worker error: failed to save check for %s: %v", t.Name, err)
						}
					}(target)
				}
			}
		}
	}()
}

func isDue(m models.Monitor) bool {
	if m.LastCheckedAt == nil {
		return true
	}
	
	nextCheck := m.LastCheckedAt.Add(time.Duration(m.Interval) * time.Second)
	return time.Now().After(nextCheck)
}
