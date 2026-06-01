.PHONY: up down start up-tunnel logs tunnel build build-dev reset dev-backend dev-frontend

# Build and start all services (postgres + backend + frontend)
up:
	docker compose up --build -d
	@echo "========================================="
	@echo "  KOBBER is running!"
	@echo "  Frontend : http://localhost:5173"
	@echo "  Backend  : http://localhost:8080"
	@echo "  Database : postgres://localhost:5433"
	@echo "========================================="
	@echo "  Run 'make tunnel' for Cloudflare Tunnel"
	@echo "  Run 'make logs' to see logs"
	@echo "  Run 'make down' to stop"
	@echo "========================================="

# Start services without rebuilding (faster for subsequent runs)
start:
	docker compose up -d
	@echo "Services started"

# Build and run with Cloudflare Tunnel
up-tunnel:
	docker compose --profile tunnel up --build -d
	@echo "KOBBER with Cloudflare Tunnel started!"

# Show logs
logs:
	docker compose logs -f

# Stop all services
down:
	docker compose down

# Start Cloudflare Tunnel standalone
tunnel:
	docker compose run --rm cloudflared

# Run backend locally (for development outside Docker)
dev-backend:
	cd backend && go run main.go

# Run frontend locally (for development outside Docker)
dev-frontend:
	cd Frontend && bun run dev

# Build all Docker images
build:
	docker compose build

# Reset everything (delete database volume)
reset:
	docker compose down -v
