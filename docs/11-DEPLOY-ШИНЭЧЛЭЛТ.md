# СДЗН Платформ - Deploy ба шинэчлэлтийн гарын авлага

## Deployment Pipeline

### Ерөнхий урсгал

```
[Local Development]
       ↓
[Git Push to main]
       ↓
[SSH to Server]
       ↓
[Pull Changes]
       ↓
[Build Images]
       ↓
[Deploy Containers]
       ↓
[Health Check]
       ↓
[Rollback if needed]
```

---

## Гараар Deploy хийх

### 1. Сервер рүү холбогдох

```bash
ssh sdyn@206.189.146.159
# эсвэл
ssh root@206.189.146.159
```

### 2. Төслийн хавтас руу орох

```bash
cd /home/sdyn/sdyn-platform
```

### 3. Өөрчлөлтүүдийг татах

```bash
git pull origin main
```

### 4. Image build хийх

```bash
# Бүх image
docker compose build

# Тодорхой сервис
docker compose build backend
docker compose build frontend
```

### 5. Container шинэчлэх

```bash
# Тодорхой сервис
docker compose up -d backend
docker compose up -d frontend

# Бүх сервис
docker compose up -d
```

### 6. Health шалгах

```bash
# Container статус
docker compose ps

# Health endpoints
curl -s https://api.e-sdy.mn/health
curl -s https://e-sdy.mn -o /dev/null -w "%{http_code}"
```

---

## Backend шинэчлэлт

### Код өөрчлөлтийн дараа

```bash
cd /home/sdyn/sdyn-platform

# Код татах
git pull origin main

# Build
docker compose build backend

# Deploy
docker compose up -d backend

# Log шалгах
docker compose logs -f --tail 50 backend
```

### Database migration

```bash
# Migration ажиллуулах
docker exec sdyn-backend /app/migrate up

# Шинэ migration file байвал
docker compose build backend
docker compose up -d backend
```

### Downtime-гүй deploy

```bash
# Шинэ container эхлүүлэх
docker compose up -d --no-deps --scale backend=2 backend

# Хуучин container устгах
docker compose up -d --no-deps --scale backend=1 backend
```

---

## Frontend шинэчлэлт

### Код өөрчлөлтийн дараа

```bash
cd /home/sdyn/sdyn-platform

# Код татах
git pull origin main

# Build (Next.js build удаан байж болно)
docker compose build --no-cache frontend

# Deploy
docker compose up -d frontend

# Health шалгах
curl -s https://e-sdy.mn -o /dev/null -w "%{http_code}"
```

### Static assets cache clear

Traefik level дээр cache байхгүй тул browser cache л асуудал үүсгэнэ:
- Build хийхэд Next.js автоматаар hash нэмнэ
- Хэрэглэгч hard refresh хийх: `Ctrl+Shift+R`

---

## Admin Portal шинэчлэлт

```bash
cd /home/sdyn/sdyn-platform

git pull origin main
docker compose build admin
docker compose up -d admin

# Шалгах
curl -s https://admin.e-sdy.mn -o /dev/null -w "%{http_code}"
```

---

## Database шинэчлэлт

### Schema өөрчлөлт

```bash
# Нөөцлөлт хийх (заавал!)
docker exec sdyn-postgres pg_dump -U sdyn_user sdyn_db > backup_before_migration.sql

# Migration ажиллуулах
docker exec sdyn-backend /app/migrate up

# Шалгах
docker exec sdyn-postgres psql -U sdyn_user -d sdyn_db -c "\dt"
```

### Data migration

```bash
# SQL script ажиллуулах
docker exec -i sdyn-postgres psql -U sdyn_user -d sdyn_db < data_migration.sql
```

---

## Keycloak шинэчлэлт

### Realm export/import

```bash
# Export
docker exec sdyn-keycloak /opt/keycloak/bin/kc.sh export \
  --dir /tmp/export --realm sdyn

docker cp sdyn-keycloak:/tmp/export ./keycloak/export

# Import
docker cp ./keycloak/realm-export.json sdyn-keycloak:/tmp/
docker exec sdyn-keycloak /opt/keycloak/bin/kc.sh import \
  --file /tmp/realm-export.json
```

### Version upgrade

```bash
# .env файлд version өөрчлөх
KEYCLOAK_VERSION=25.0

# Rebuild
docker compose build keycloak
docker compose up -d keycloak
```

---

## Rollback

### Хурдан rollback

```bash
# Өмнөх image руу буцах
docker compose down backend
docker image tag sdyn-backend:latest sdyn-backend:failed
docker image tag sdyn-backend:previous sdyn-backend:latest
docker compose up -d backend
```

### Git-ээр rollback

```bash
# Өмнөх commit руу буцах
git log --oneline -5
git checkout <commit_hash>

# Build and deploy
docker compose build backend
docker compose up -d backend

# Main руу буцах
git checkout main
```

### Database rollback

```bash
# Migration буцаах
docker exec sdyn-backend /app/migrate down 1

# Нөөцлөлтөөс сэргээх
cat backup_before_migration.sql | docker exec -i sdyn-postgres psql -U sdyn_user -d sdyn_db
```

---

## Environment Variable өөрчлөх

### .env файл засах

```bash
# Backup
cp .env .env.backup

# Засах
nano .env

# Restart (шаардлагатай сервисүүд)
docker compose up -d backend frontend
```

### Нууц үг солих

```bash
# PostgreSQL
POSTGRES_PASSWORD=new_secure_password
docker compose up -d postgres backend

# Redis
REDIS_PASSWORD=new_redis_password
docker compose up -d redis backend

# Keycloak admin
KEYCLOAK_ADMIN_PASSWORD=new_admin_password
docker compose up -d keycloak
```

---

## SSL сертификат

### Автомат шинэчлэлт

Traefik Let's Encrypt автоматаар шинэчилнэ. Гараар оролцох шаардлагагүй.

### Гараар шинэчлэх

```bash
# acme.json устгах
rm traefik/acme.json
touch traefik/acme.json
chmod 600 traefik/acme.json

# Traefik restart
docker compose restart traefik

# Log шалгах
docker compose logs -f traefik | grep -i certificate
```

---

## Шалгах алхамууд

### Deploy-ийн дараа заавал шалгах

```bash
# 1. Container статус
docker compose ps

# 2. Health endpoints
curl -s https://api.e-sdy.mn/health | jq .
curl -s https://e-sdy.mn -o /dev/null -w "Frontend: %{http_code}\n"
curl -s https://admin.e-sdy.mn -o /dev/null -w "Admin: %{http_code}\n"
curl -s https://auth.e-sdy.mn -o /dev/null -w "Keycloak: %{http_code}\n"

# 3. Logs шалгах (error байхгүй эсэх)
docker compose logs --since 5m | grep -i error

# 4. Database холболт
docker exec sdyn-backend wget -qO- http://127.0.0.1:8080/health | jq .
```

### Smoke test

```bash
# API test
curl -X POST https://api.e-sdy.mn/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# Хэрэв authentication шаардлагатай бол skip хийж болно
```

---

## Monitoring шалгах

### Deploy-ийн дараа

```bash
# Grafana dashboard нээх
# https://grafana.e-sdy.mn

# Prometheus targets шалгах
# http://localhost:9090/targets (сервер дээрээс)

# Container logs Loki-д очиж байгаа эсэх
# Grafana > Explore > Loki > {container="sdyn-backend"}
```

---

## Scheduled Maintenance

### Maintenance горимд оруулах

```bash
# Maintenance page харуулах (Traefik дээр)
# traefik/dynamic/maintenance.yml үүсгэх

http:
  routers:
    maintenance:
      rule: "HostRegexp(`{host:.+}`)"
      priority: 9999
      service: maintenance-service

  services:
    maintenance-service:
      loadBalancer:
        servers:
          - url: "http://maintenance-page:80"
```

### Maintenance дууссаны дараа

```bash
# Maintenance config устгах
rm traefik/dynamic/maintenance.yml

# Traefik reload (автомат)
```

---

## Checklist

### Deploy-ийн өмнө

- [ ] Код review хийсэн
- [ ] Test-үүд pass болсон
- [ ] Database backup авсан
- [ ] .env файл өөрчлөлт шаардлагатай эсэх

### Deploy-ийн дараа

- [ ] Бүх container running/healthy
- [ ] Health endpoints ажиллаж байгаа
- [ ] Error log байхгүй
- [ ] Grafana дээр alert байхгүй
- [ ] Хэрэглэгчийн талаас функц ажиллаж байгаа

---

## Автомат Deploy (CI/CD)

### GitHub Actions жишээ

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: 206.189.146.159
          username: sdyn
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /home/sdyn/sdyn-platform
            git pull origin main
            docker compose build
            docker compose up -d
            docker compose ps
```

### Webhook trigger

```bash
# Сервер дээр webhook listener
# /home/sdyn/scripts/deploy-webhook.sh

#!/bin/bash
cd /home/sdyn/sdyn-platform
git pull origin main
docker compose build
docker compose up -d
echo "Deploy completed at $(date)"
```

---
*Баримт бичгийн хувилбар: 1.0*
*Сүүлд шинэчилсэн: 2026-01-26*
