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

var httpClient = &http.Client{
	Timeout: 5 * time.Second,
	Transport: &http.Transport{
		MaxIdleConns:        100,
		IdleConnTimeout:     90 * time.Second,
		DisableKeepAlives:   false,
	},
}

func PerformHTTPCheck(url string) CheckResult {
	start := time.Now()
	
	req, err := http.NewRequest("HEAD", url, nil)
	if err != nil {
		return CheckResult{IsUp: false}
	}

	resp, err := httpClient.Do(req)
	latency := time.Since(start).Milliseconds()

	if err != nil {
		start = time.Now()
		resp, err = httpClient.Get(url)
		latency = time.Since(start).Milliseconds()
		
		if err != nil {
			return CheckResult{
				StatusCode: 0,
				Latency:    latency,
				IsUp:       false,
			}
		}
	}
	defer resp.Body.Close()

	return CheckResult{
		StatusCode: resp.StatusCode,
		Latency:    latency,
		IsUp:       resp.StatusCode >= 200 && resp.StatusCode < 400,
	}
}
