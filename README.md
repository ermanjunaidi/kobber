# KOBBER

**Forum multi-stakeholder Brebes** — Platform informasi publik, layanan AI warga, kolaborasi anggota, dan fundraising transparan.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS |
| Backend | Go + Fiber |
| Database | PostgreSQL 16 |
| Dev Server | Vite (hot reload) + Go (API) |
| Production | Single binary (Go serves frontend + API) |
| Tunnel | Cloudflare Tunnel (trycloudflare.com) |

## Prerequisites

- [Go](https://go.dev/) 1.25+
- [Bun](https://bun.sh/) (package manager & runtime)
- [Docker](https://www.docker.com/) + [Docker Compose](https://docs.docker.com/compose/)
- [Cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) (opsional, untuk tunnel)

## Perintah Makefile

### 🚀 Mode Development (hot reload)

| Perintah | Fungsi |
|----------|--------|
| `make dev` | Jalankan semuanya lokal: PostgreSQL di Docker, backend Go, frontend Vite (hot reload) |
| `make up` | Build & start semua service di Docker — frontend dev server di `:5173`, API di `:8080` |
| `make up-tunnel` | Sama seperti `make up` + Cloudflare Tunnel |
| `make start` | Start service Docker tanpa rebuild |
| `make dev-backend` | Jalankan backend Go saja (lokal) |
| `make dev-frontend` | Jalankan frontend Vite saja (lokal) |

```
make dev
  → Frontend : http://localhost:5173
  → Backend  : http://localhost:8080
  → Network  : http://192.168.1.x:5173  (auto-detect)
```

### 🏭 Mode Production (stabil, single port)

| Perintah | Fungsi |
|----------|--------|
| `make prod` | Build & start production — satu port `:8080` melayani frontend + API |
| `make prod-tunnel` | Production + Cloudflare Tunnel |
| `make build-prod` | Build image Docker production saja |

```
make prod
  → URL : http://localhost:8080
```

### 🌐 Cloudflare Tunnel (akses dari internet)

| Perintah | Fungsi |
|----------|--------|
| `make tunnel` | Jalankan tunnel saja (attach ke terminal, lihat URL langsung) |
| `make tunnel-url` | Tampilkan URL tunnel dari logs |
| `make prod-tunnel` | Production + tunnel (gabungan) |

```
make prod-tunnel
  → Tunnel URL: https://xxx.trycloudflare.com
```

### 🛠 Utilitas

| Perintah | Fungsi |
|----------|--------|
| `make logs` | Streaming logs semua container |
| `make down` | Hentikan semua service |
| `make build` | Build image Docker untuk development |
| `make build-prod` | Build image Docker production saja (frontend + backend) |
| `make reset` | Hentikan service + hapus volume database (data hilang!) |

## Alur Kerja

### Development (hot reload)

```bash
# Cepat — semua berjalan di host (rekomendasi)
make dev

# Atau via Docker
make up
```

### Testing akses lokal

```bash
# Cek di perangkat lain dalam WiFi yang sama
make dev
# Network: http://192.168.1.x:5173
```

### Production

```bash
# Build & jalankan production
make prod

# Atau dengan akses internet via Cloudflare
make prod-tunnel
```

## Struktur Project

```
├── Frontend/           # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/      # Halaman: Beranda, Admin, Donasi, dll.
│   │   ├── components/ # Komponen UI
│   │   └── lib/        # API client, auth, utils
│   └── vite.config.ts
├── backend/            # Go + Fiber API
│   ├── handlers/       # Route handlers
│   ├── db/             # Database connection & migrations
│   ├── models/         # Data models
│   └── uploads/        # Gambar yang diupload
├── docker-compose.yml
└── Makefile
```

## Admin Panel

Login admin di `/admin/login`.
