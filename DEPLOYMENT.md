# EC2 Deployment Plan — QuessCorpAssignment

**Two subdomains** | Docker Compose | Nginx + SSL | PostgreSQL with persistent volume

---

## Architecture

```
assignment.anzar.wtf  →  Nginx (host)  →  Next.js   (Docker :3000)
backend.anzar.wtf     →  Nginx (host)  →  Django    (Docker :8000)
                                          PostgreSQL (Docker :5432) ← named volume
```

- **Nginx** runs on the host with two server blocks (one per subdomain)
- **Certbot** issues SSL certs for both subdomains
- **PostgreSQL data** persists via a Docker **named volume** — survives restarts, rebuilds, redeploys

---

## How PostgreSQL Persistence Works

```yaml
# In docker-compose.yml
volumes:
  pgdata:           # ← Docker creates a named volume on the host

services:
  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data   # ← Maps container DB files to host volume
```

**What this means:**

| Action | Data safe? |
|--------|-----------|
| `docker compose down` | ✅ Yes — volume persists |
| `docker compose down && docker compose up` | ✅ Yes |
| `docker compose up -d --build` (rebuild) | ✅ Yes |
| Server reboot | ✅ Yes |
| `docker volume rm pgdata` | ❌ **Deleted** — only this destroys it |

The volume lives at `/var/lib/docker/volumes/pgdata/` on the host. You can also back it up:
```bash
# Backup
docker compose exec db pg_dump -U quess quessdb > backup.sql

# Restore
cat backup.sql | docker compose exec -T db psql -U quess quessdb
```

---

## Step-by-Step Deployment

### Step 1: EC2 Setup (one-time, ~10 min)

1. **Launch t3.small** — Ubuntu 22.04 LTS AMI
2. **Security Group** — open ports `22`, `80`, `443`
3. **SSH in**: `ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>`
4. **Install Docker:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y docker.io docker-compose-v2
   sudo usermod -aG docker $USER
   # Log out & back in
   ```
5. **Add 2GB swap** (safety net):
   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile && sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

---

### Step 2: DNS Records (do this early — propagation takes a few minutes)

Add two A records at your domain registrar:

| Type | Name         | Value            |
|------|--------------|------------------|
| A    | `assignment` | `<EC2-PUBLIC-IP>`|
| A    | `backend`    | `<EC2-PUBLIC-IP>`|

---

### Step 3: Clone & Configure (~3 min)

```bash
git clone https://github.com/YOUR_USER/QuessCorpAssignment.git
cd QuessCorpAssignment

# Create .env
cat > .env << 'EOF'
POSTGRES_DB=quessdb
POSTGRES_USER=quess
POSTGRES_PASSWORD=<pick-a-strong-password>
DJANGO_SECRET_KEY=<generate-a-random-string>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=backend.anzar.wtf,localhost
CORS_ALLOWED_ORIGINS=https://assignment.anzar.wtf
NEXT_PUBLIC_API_BASE_URL=https://backend.anzar.wtf/api
DATABASE_URL=postgresql://quess:<pick-a-strong-password>@db:5432/quessdb
EOF
```

---

### Step 4: Docker Compose Up (~5 min first time)

```bash
docker compose up -d --build

# Run migrations
docker compose exec backend python manage.py migrate

# Verify
docker compose ps          # All 3 containers should be "Up"
curl http://localhost:8000/api/
curl http://localhost:3000
```

---

### Step 5: Nginx Setup (~3 min)

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Create Nginx config:
```bash
sudo tee /etc/nginx/sites-available/quess << 'EOF'
# Frontend — assignment.anzar.wtf
server {
    listen 80;
    server_name assignment.anzar.wtf;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend — backend.anzar.wtf
server {
    listen 80;
    server_name backend.anzar.wtf;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/quess /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

---

### Step 6: SSL with Certbot (~2 min)

```bash
sudo certbot --nginx -d assignment.anzar.wtf -d backend.anzar.wtf
```

Certbot auto-modifies nginx config to add SSL and sets up auto-renewal via systemd timer.

---

## Files to Create in Repo

| File | Purpose |
|------|---------|
| `Dockerfile.backend` | Python 3.12-slim, Gunicorn, 2 workers |
| `Dockerfile.frontend` | Node 20 Alpine, Next.js standalone build |
| `docker-compose.yml` | 3 services: db, backend, frontend + pgdata volume |
| `.env` (on server only) | Secrets — **do NOT commit** |

Plus one tweak: add `output: "standalone"` to `frontend/next.config.ts`.

---

## Verification Checklist

- [ ] DNS: `dig assignment.anzar.wtf` and `dig backend.anzar.wtf` return EC2 IP
- [ ] Docker: `docker compose ps` shows 3 healthy containers
- [ ] Backend: `curl https://backend.anzar.wtf/api/` returns JSON
- [ ] Frontend: `https://assignment.anzar.wtf` loads in browser
- [ ] SSL: padlock shows on both subdomains
- [ ] DB persistence: `docker compose down && docker compose up -d` — data still there

---

## Cost

| Item | Cost |
|------|------|
| t3.small | ~$15/month (free tier: 750 hrs/month for 12 months) |
| SSL | Free (Certbot/Let's Encrypt) |
| Domain | Already owned |
