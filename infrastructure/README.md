# 🏗️ Infrastructure — Traefik Reverse Proxy

Pusat routing untuk semua aplikasi Docker. Dengan Traefik, setiap app bisa diakses
via domain/subdomain tanpa bentrok port.

## Cara Kerja

```
Internet → Cloudflare → cloudflared (tunnel) → Traefik (port 80) → app:PORT
```

- **Cloudflare Tunnel** menerima traffic dari internet dan meneruskan ke Traefik
- **Traefik** membaca `Host` header dan merouting ke container yang tepat
- **Setiap app** tidak perlu expose port ke host — cukup ke network `traefik-public`

## Setup Awal

```bash
# 1. Buat shared network
docker network create traefik-public

# 2. Copy & edit env
cp .env.example .env

# 3. Jalankan Traefik
docker compose up -d
```

## Cara Menambahkan App Baru

### 1. Di `docker-compose.yml` app kamu:

```yaml
services:
  app-kamu:
    # ... konfigurasi existing ...
    networks:
      - default
      - traefik-public    # ← tambahkan ini
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app-kamu.rule=Host(`app-kamu.domain.com`)"
      - "traefik.http.services.app-kamu.loadbalancer.server.port=8080"

networks:
  traefik-public:
    external: true
```

### 2. Update `cloudflared/config.yml`:

```yaml
ingress:
  - hostname: app-kamu.domain.com
    service: http://traefik:80    # ← routing ke Traefik
```

### 3. Update Cloudflare DNS:

Buat CNAME record `app-kamu` → tunnel CNAME (biasanya `tunnel-id.cfargotunnel.com`)

## App yang Terdaftar

| Domain | App | Port Internal |
|--------|-----|--------------|
| raportns.my.id | kobber | 8080 |
| (tambah) | ... | ... |

## Tips

- **Port internal** app bebas (3000, 8080, dll) — tidak perlu unik antar app
- **Cuma Traefik** yang perlu port unik di host (80/443)
- **Gunakan dev mode** dengan port host langsung untuk development (localhot)
- **Production** hanya lewat Traefik + Cloudflare Tunnel
