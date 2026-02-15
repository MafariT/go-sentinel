# Go-Sentinel

A lightweight, zero-configuration service monitoring dashboard built with **Go** and **React**.

## Features
- **Instant Latency Checks:** Real-time monitoring.
- **Visual Trends:** Graphs showing latency history for the last 50 checks.
- **Zero-Config Database:** Uses SQLite with automatic 7-day data retention.
- **Hidden Admin Mode:** Securely manage monitors via a secret URL parameter.

## Quick Start (Deployment)

### Docker
1. **Build the image:**
   ```bash
   docker build -t go-sentinel .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     -p 8088:8088 \
     -v ./data:/app/data \
     -e ADMIN_TOKEN=your_secret_token \
     -e DB_PATH=/app/data/monitor.db \
     --name go-sentinel \
     go-sentinel
   ```

## Admin Mode
By default, the dashboard is **read-only**. To manage monitors:
1. Visit `http://your-domain.com/?admin=true`.
2. Enter your `ADMIN_TOKEN`.
3. The dashboard will now show **+ Add Monitor** and **Delete** buttons.

## Configuration
| Variable | Description | Default |
| :--- | :--- | :--- |
| `ADMIN_TOKEN` | Secret key required to add/delete monitors | - |
| `DB_PATH` | Path to the SQLite database file | `monitor.db` |
| `PORT` | Port for the web server | `8088` |

## Manual Build
```bash
# Build the frontend
cd web && npm install && npm run build && cd ..

# Build the backend
go build -o go-sentinel main.go
```