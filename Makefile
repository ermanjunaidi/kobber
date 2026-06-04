.PHONY: up down start up-tunnel logs tunnel tunnel-url build build-prod build-dev reset dev-backend dev-frontend dev prod prod-tunnel infra infra-up infra-down infra-logs add-app

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
	@echo "  Tunnel: https://raportns.my.id"
	@docker compose logs cloudflared 2>/dev/null | grep -q "Registered tunnel connection" && echo "  Status: Connected" || echo "  Status: (masih memulai, jalankan 'make tunnel-url' nanti)"
	@echo ""
	@echo "  Run 'make tunnel-url' to check status"
	@echo "  Run 'make logs' to see logs"
	@echo "  Run 'make down' to stop"
	@echo ""

# Build and run dev server with Cloudflare Tunnel
up-tunnel:
	docker compose --profile dev --profile tunnel up --build -d
	@echo "========================================="
	@echo "  Starting KOBBER Dev + Cloudflare Tunnel..."
	@echo "========================================="
	@sleep 5
	@echo ""
	@echo "  Tunnel: https://raportns.my.id"
	@docker compose logs cloudflared 2>/dev/null | grep -q "Registered tunnel connection" && echo "  Status: Connected" || echo "  Status: (masih memulai, jalankan 'make tunnel-url' nanti)"
	@echo ""
	@echo "  Run 'make tunnel-url' to check status"
	@echo "  Run 'make logs' to see logs"
	@echo "  Run 'make down' to stop"
	@echo ""

# Start services without rebuilding (faster for subsequent runs)
start:
	docker compose --profile dev up -d
	@echo "Dev services started"

# Show logs
logs:
	docker compose logs -f

# Stop all services
down:
	docker compose down

# Start Cloudflare Tunnel standalone (tunnels to backend:8080 which serves frontend + API)
tunnel:
	docker compose run --rm cloudflared

# Show Cloudflare Tunnel status
tunnel-url:
	@RUNNING=$$(docker compose ps cloudflared --format "{{.Status}}" 2>/dev/null | grep -c "Up"); \
	CONNECTED=$$(docker compose logs cloudflared 2>/dev/null | grep -c "Registered tunnel connection"); \
	ORIGIN_ERRORS=$$(docker compose logs cloudflared 2>/dev/null | grep -c "Unable to reach the origin"); \
	TRAEFIK=$$(docker ps --format '{{.Names}}' 2>/dev/null | grep -c "^traefik$$"); \
	echo "  Tunnel    : https://raportns.my.id"; \
	if [ "$$RUNNING" -gt 0 ] && [ "$$CONNECTED" -gt 0 ]; then \
		echo "  Status    : Connected to Cloudflare ✅"; \
		if [ "$$ORIGIN_ERRORS" -eq 0 ]; then \
			if [ "$$TRAEFIK" -gt 0 ]; then \
				echo "  Routing   : cloudflared → Traefik → backend:8080"; \
			else \
				echo "  Routing   : cloudflared → backend:8080 (⚠️ Traefik not running, run 'make infra-up')"; \
			fi \
		else \
			echo "  Backend   : ❌ Origin unreachable"; \
		fi \
	elif [ "$$RUNNING" -gt 0 ]; then \
		echo "  Status    : Starting..."; \
	else \
		echo "  Status    : Container not running. Run 'make prod-tunnel' or 'make up-tunnel' first."; \
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

# ────────────────────────────────────────────────────────────────────────────
#  INFRASTRUCTURE (Traefik Reverse Proxy)
# ────────────────────────────────────────────────────────────────────────────

# Setup infrastruktur (Traefik + shared network) — jalankan sekali
infra:
	@echo "========================================="
	@echo "  Setting up Traefik infrastructure..."
	@echo "========================================="
	@docker network create traefik-public 2>/dev/null && echo "  Network 'traefik-public' created ✅" || echo "  Network 'traefik-public' already exists ✅"
	cd infrastructure && docker compose up -d
	@echo ""
	@echo "  Traefik dashboard: https://traefik.raportns.my.id"
	@echo "  (perlu setup DNS & label dashboard dulu)"
	@echo ""

# Start Traefik saja (kalau sudah pernah infra)
infra-up:
	cd infrastructure && docker compose up -d
	@echo "  Traefik started ✅"

# Stop Traefik
infra-down:
	cd infrastructure && docker compose down
	@echo "  Traefik stopped"

# Logs Traefik
infra-logs:
	cd infrastructure && docker compose logs -f

# ────────────────────────────────────────────────────────────────────────────
#  TEMPLATE: cara cepat tambah app baru ke Traefik
# ────────────────────────────────────────────────────────────────────────────
# Gunakan: make add-app name=appkamu domain=appkamu.domain.com port=3000
add-app:
	@if [ -z "$(name)" ] || [ -z "$(domain)" ] || [ -z "$(port)" ]; then \
		echo "Usage: make add-app name=myapp domain=myapp.example.com port=3000"; \
		exit 1; \
	fi
	@echo ""
	@echo "=== Langkah menambahkan $(name) ke Traefik ==="
	@echo ""
	@echo "1. Tambahkan ini ke docker-compose.yml project $(name):"
	@echo ""
	@echo "   services:"
	@echo "     $(name):"
	@echo "       # ... konfigurasi existing ..."
	@echo "       networks:"
	@echo "         - default"
	@echo "         - traefik-public"
	@echo "       labels:"
	@echo "         - \"traefik.enable=true\""
	@echo "         - \"traefik.http.routers.$(name).rule=Host(\`$(domain)\`)\""
	@echo "         - \"traefik.http.routers.$(name).entrypoints=web\""
	@echo "         - \"traefik.http.services.$(name).loadbalancer.server.port=$(port)\""
	@echo ""
	@echo "   networks:"
	@echo "     traefik-public:"
	@echo "       external: true"
	@echo ""
	@echo "2. Tambahkan ini ke cloudflared/config.yml:"
	@echo ""
	@echo "   ingress:"
	@echo "     - hostname: $(domain)"
	@echo "       service: http://traefik:80"
	@echo ""
	@echo "3. Di Cloudflare Dashboard, buat CNAME: $(name) → tunnel-id.cfargotunnel.com"
	@echo ""
	@echo "4. Restart: docker compose -p $(name) up -d && docker compose restart cloudflared"
	@echo ""

# Reset everything (delete database volume)
reset:
	docker compose down -v
