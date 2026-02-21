package monitor

import (
	"context"
	"database/sql"
	"go-sentinel/internal/db"
	"go-sentinel/internal/models"
	"go-sentinel/internal/service/checker"
	"go-sentinel/internal/service/notifier"
	"log"
	"sync"
	"time"
)

const (
	workerTickInterval = 30 * time.Second
)

func StartWorker(ctx context.Context, database *sql.DB) {
	ticker := time.NewTicker(workerTickInterval)
	cleanupTicker := time.NewTicker(1 * time.Hour)
	var monitorState sync.Map

	go func() {
		defer ticker.Stop()
		defer cleanupTicker.Stop()

		for {
			select {
			case <-ctx.Done():
				log.Println("Worker shutdown complete")
				return

			case <-ticker.C:
				targets, err := db.GetMonitors(ctx, database)
				if err != nil {
					log.Printf("Worker error: failed to fetch monitors: %v", err)
					continue
				}

				dueCount := 0
				for _, target := range targets {
					if isDue(target) {
						dueCount++
						if err := db.UpdateLastChecked(ctx, database, target.ID); err != nil {
							log.Printf("Worker error: failed to update timestamp: %v", err)
							continue
						}

						go func(t models.Monitor) {
							result := checker.PerformHTTPCheck(ctx, t.URL)

							check := models.Check{
								MonitorID:  t.ID,
								StatusCode: result.StatusCode,
								Latency:    result.Latency,
								IsUp:       result.IsUp,
							}

							if err := db.SaveCheckAndUpdateStats(ctx, database, check); err != nil {
								log.Printf("Worker error: failed to save check for %s: %v", t.Name, err)
							}

							if prev, known := monitorState.Load(t.ID); known && prev.(bool) != result.IsUp {
								notifier.NotifyStateChange(ctx, database, t, check)
							}
							monitorState.Store(t.ID, result.IsUp)
						}(target)
					}
				}

				if dueCount > 0 {
					log.Printf("Worker: processed %d due monitors", dueCount)
				}

			case <-cleanupTicker.C:
				rows, err := db.CleanupOldChecks(ctx, database, 7)
				if err != nil {
					log.Printf("Cleanup error: %v", err)
				} else if rows > 0 {
					log.Printf("Cleanup: removed %d old check records", rows)
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
