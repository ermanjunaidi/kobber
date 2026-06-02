.PHONY: up down start up-tunnel logs tunnel tunnel-url build build-prod build-dev reset dev-backend dev-frontend dev prod prod-tunnel

# Run everything locally with one command:
#   Database in Docker, backend & frontend on host
#
# Usage:
#   make dev
dev:
	@echo "Starting PostgreSQL in Docker..."
	docker compose up postgres -d --wait
	@echo ""
	@echo "========================================="
	@echo "  Installing frontend dependencies..."
	@echo "========================================="
	cd Frontend && bun install
	@echo ""
	@echo "========================================="
	@echo "  Starting backend & frontend locally..."
	@echo "========================================="
	@echo ""
	@# Get local network IP
	$(eval LOCAL_IP := $(shell hostname -I 2>/dev/null | awk '{print $$1}' || ipconfig getifaddr en0 2>/dev/null || echo "localhost"))
	@echo "  Frontend  : http://localhost:5173"
	@echo "  Network   : http://$(LOCAL_IP):5173"
	@echo "  Backend   : http://localhost:8081"
	@echo "  Production: http://localhost:8080 (Docker)"
	@echo ""
	@# Kill leftover processes on dev ports
	@lsof -ti:8081 2>/dev/null | xargs kill -9 2>/dev/null; true
	@lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null; true
	@trap 'kill 0' EXIT; \
	cd backend && PORT=8081 go run main.go & \
	cd Frontend && API_PROXY_TARGET=http://localhost:8081 bun run dev & \
	wait

# Build and start all services (postgres + backend + frontend) in dev mode
up:
	docker compose --profile dev up --build -d
	@echo "========================================="
	@echo "  KOBBER is running! (DEV mode)"
	@echo "  Frontend : http://localhost:5173"
	@echo "  Backend  : http://localhost:8080"
	@echo "  Database : postgres://localhost:5434"
	@echo "========================================="
	@echo "  Run 'make up-tunnel' to expose dev server via Cloudflare"
	@echo "  Run 'make logs' to see logs"
	@echo "  Run 'make down' to stop"
	@echo "========================================="

# Production: build & start frontend + backend in one binary (stable, single port)
prod:
	docker compose up --build -d
	@echo "========================================="
	@echo "  KOBBER is running! (PRODUCTION mode)"
	@echo "  URL : http://localhost:8080"
	@echo "========================================="
	@echo "  Frontend & API served from the same port"
	@echo "  Run 'make prod-tunnel' to expose via Cloudflare"
	@echo "  Run 'make logs' to see logs"
	@echo "  Run 'make down' to stop"
	@echo "========================================="

# Production + Cloudflare Tunnel
prod-tunnel:
	docker compose --profile prod up --build -d
	@echo "========================================="
	@echo "  Starting KOBBER Production + Cloudflare Tunnel..."
	@echo "========================================="
	@sleep 8
	@echo ""
	@echo "  Tunnel URL:"
	@docker compose logs cloudflared 2>/dev/null | grep -oP 'https?://[a-z0-9.-]+\.trycloudflare\.com' | tail -1 || echo "  (masih memulai, jalankan 'make tunnel-url' nanti)"
	@echo ""
	@echo "  Run 'make tunnel-url' to get the URL again"
	@echo "  Run 'make logs' to see logs"
	@echo "  Run 'make down' to stop"
	@echo ""

# Start services without rebuilding (faster for subsequent runs)
start:
	docker compose --profile dev up -d
	@echo "Dev services started"

# Build and run dev server with Cloudflare Tunnel
up-tunnel:
	docker compose --profile dev --profile tunnel up --build -d
	@echo "========================================="
	@echo "  Starting KOBBER Dev + Cloudflare Tunnel..."
	@echo "========================================="
	@sleep 5
	@echo ""
	@echo "  Tunnel URL:"
	@docker compose logs cloudflared 2>/dev/null | grep -oP 'https?://[a-z0-9.-]+\.trycloudflare\.com' | tail -1 || echo "  (masih memulai, jalankan 'make tunnel-url' nanti)"
	@echo ""
	@echo "  Run 'make tunnel-url' to get the URL again"
	@echo "  Run 'make logs' to see logs"
	@echo "  Run 'make down' to stop"
	@echo ""

# Show logs
logs:
	docker compose logs -f

# Stop all services
down:
	docker compose down

# Start Cloudflare Tunnel standalone (tunnels to backend:8080 which serves frontend + API)
tunnel:
	docker compose run --rm cloudflared

# Show the Cloudflare Tunnel URL from logs
tunnel-url:
	@URL=$$(docker compose logs cloudflared 2>/dev/null | grep -oP 'https?://[a-z0-9.-]+\.trycloudflare\.com' | tail -1); \
	if [ -n "$$URL" ]; then \
		echo "  Tunnel URL: $$URL"; \
	else \
		echo "  Tunnel belum siap. Jalankan 'make logs' dan cari URL https://....trycloudflare.com"; \
	fi

# Run backend locally (for development outside Docker)
dev-backend:
	cd backend && PORT=8081 go run main.go

# Run frontend locally (for development outside Docker)
dev-frontend:
	cd Frontend && bun run dev

# Build all Docker images
build:
	docker compose --profile dev build

# Build production image only
build-prod:
	docker compose build

# Reset everything (delete database volume)
reset:
	docker compose down -v
