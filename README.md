# Go-Sentinel

A lightweight, zero-configuration service monitoring dashboard built with **Go** and **React**.

## Features
- **Instant Latency Checks:** Real-time monitoring.
- **Visual Trends:** Graphs showing latency history for the last 50 checks.
- **Zero-Config Database:** Uses SQLite with automatic 7-day data retention.
- **Hidden Admin Mode:** Securely manage monitors via a secret URL parameter.

## Quick Start (Docker)

1. **Clone the repo:**
   ```bash
   git clone https://github.com/mafarit/go-sentinel.git
   cd go-sentinel
   ```

2. **Run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

3. **Access the Dashboard:**
   Visit `http://localhost:8088`.

## Admin Mode
By default, the dashboard is **read-only**. To manage monitors:
1. Visit `http://localhost:8088/?admin=true`.
2. Enter your `ADMIN_TOKEN`.
3. The dashboard will now show **+ Add Monitor** and **Delete** buttons.

## Configuration
| Variable | Description | Default |
| :--- | :--- | :--- |
| `ADMIN_TOKEN` | Secret key required to add/delete monitors | (empty) |
| `DB_PATH` | Path to the SQLite database file | `monitor.db` |
| `PORT` | Port for the web server | `8088` |

## Manual Build
If you want to build the binary manually:
```bash
# Build the frontend
cd web && npm install && npm run build && cd ..

# Build the backend
go build -o go-sentinel main.go
```