package checker

import (
	"net/http"
	"time"
)

type CheckResult struct {
	StatusCode int
	Latency    int64
	IsUp       bool
}

func PerformHTTPCheck(url string) CheckResult {
	start := time.Now()
	client := http.Client{
		Timeout: 5 * time.Second,
	}
	
	resp, err := client.Get(url)
	latency := time.Since(start).Milliseconds()
	if err != nil {
		return CheckResult{
			StatusCode: 0,
			Latency:    latency,
			IsUp:       false,
		}
	}
	defer resp.Body.Close()

	return CheckResult{
		StatusCode: resp.StatusCode,
		Latency:    latency,
		IsUp:       resp.StatusCode >= 200 && resp.StatusCode < 300,
	}
}
