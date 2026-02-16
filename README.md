# Go-Sentinel

A lightweight, zero-configuration service monitoring dashboard.

## Quick Start (Docker)

```bash
docker build -t go-sentinel .

docker run -d -p 8088:8088 \
  -e ADMIN_TOKEN=my_secret \
  -v ./data:/app/data \
  --name sentinel go-sentinel
```

## How to use
- **View Dashboard:** Open `http://your.website.com`
- **Admin Mode:** Visit `http://your.website.com?admin=true` and enter your `ADMIN_TOKEN`.

## Configuration
| Env Var | Description | Default |
| :--- | :--- | :--- |
| `ADMIN_TOKEN` | Secret key for admin actions (required for Write access) | - |
| `DB_PATH` | Path to SQLite database | `monitor.db` |
| `PORT` | Web server port | `8088` |

## Development
```bash
./dev.sh
```