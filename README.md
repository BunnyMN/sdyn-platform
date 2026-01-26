# СДЗН Platform

Социал Демократ Залуучуудын Нэгдлийн гишүүнчлэлийн удирдлагын систем.

## Tech Stack

- **Backend**: Go 1.22+ (Fiber)
- **Frontend**: Next.js 14
- **Database**: PostgreSQL 16 + Redis 7
- **Auth**: Keycloak 24
- **Storage**: MinIO
- **Proxy**: Traefik v3 (Auto SSL)
- **Monitoring**: Grafana + Prometheus + Loki

## Quick Start

### 1. Server Setup

```bash
# SSH to server
ssh root@206.189.146.159

# Run setup script
chmod +x scripts/setup-server.sh
./scripts/setup-server.sh
```

### 2. Configure Environment

```bash
# Copy and edit .env file
cp .env.example .env
nano .env

# Generate passwords and update:
# - POSTGRES_PASSWORD
# - REDIS_PASSWORD
# - KEYCLOAK_ADMIN_PASSWORD
# - MINIO_ROOT_PASSWORD
# - JWT_SECRET
# - GRAFANA_ADMIN_PASSWORD
```

### 3. DNS Configuration

Point these records to `206.189.146.159`:

| Record | Type | Value |
|--------|------|-------|
| e-sdy.mn | A | 206.189.146.159 |
| api.e-sdy.mn | A | 206.189.146.159 |
| admin.e-sdy.mn | A | 206.189.146.159 |
| auth.e-sdy.mn | A | 206.189.146.159 |
| grafana.e-sdy.mn | A | 206.189.146.159 |
| minio.e-sdy.mn | A | 206.189.146.159 |

### 4. Deploy

```bash
# Create acme.json for SSL
touch traefik/acme.json
chmod 600 traefik/acme.json

# Deploy
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## Services

| Service | URL | Port |
|---------|-----|------|
| Frontend | https://e-sdy.mn | 3000 |
| Admin | https://admin.e-sdy.mn | 3001 |
| API | https://api.e-sdy.mn | 8080 |
| Keycloak | https://auth.e-sdy.mn | 8080 |
| Grafana | https://grafana.e-sdy.mn | 3000 |
| MinIO | https://minio.e-sdy.mn | 9000 |

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Members
- `GET /api/v1/members` - List members
- `GET /api/v1/members/:id` - Get member
- `POST /api/v1/members` - Create member
- `PUT /api/v1/members/:id` - Update member
- `DELETE /api/v1/members/:id` - Delete member

### Organizations
- `GET /api/v1/organizations` - List organizations
- `GET /api/v1/organizations/:id` - Get organization
- `POST /api/v1/organizations` - Create organization
- `PUT /api/v1/organizations/:id` - Update organization

### Events
- `GET /api/v1/events` - List events
- `GET /api/v1/events/:id` - Get event
- `POST /api/v1/events` - Create event
- `PUT /api/v1/events/:id` - Update event
- `POST /api/v1/events/:id/register` - Register for event

### Fees
- `GET /api/v1/fees` - List fees
- `POST /api/v1/fees` - Create fee
- `PUT /api/v1/fees/:id` - Update fee

## Commands

```bash
# View logs
docker compose logs -f backend

# Restart service
docker compose restart backend

# Check status
docker compose ps

# Database shell
docker exec -it sdyn-postgres psql -U sdyn_user -d sdyn_db

# Redis shell
docker exec -it sdyn-redis redis-cli -a $REDIS_PASSWORD

# Backup
./scripts/backup.sh
```

## Directory Structure

```
sdyn-platform/
├── docker-compose.yml      # Main compose file
├── .env                    # Environment variables
├── traefik/               # Traefik configuration
├── postgres/              # PostgreSQL init scripts
├── keycloak/              # Keycloak configuration
├── minio/                 # MinIO configuration
├── monitoring/            # Prometheus, Grafana, Loki
├── backend/               # Go API
├── frontend/              # Next.js web app
├── admin/                 # Admin portal
├── scripts/               # Deployment scripts
└── docs/                  # Documentation
```

## Maintenance

### Backup
Backups run daily at 2 AM (cron):
```bash
0 2 * * * /home/sdyn/sdyn-platform/scripts/backup.sh
```

### Updates
```bash
cd /home/sdyn/sdyn-platform
git pull
./scripts/deploy.sh
```

### SSL Renewal
Traefik handles SSL renewal automatically via Let's Encrypt.

## Support

For issues and questions:
- GitHub Issues
- Email: admin@e-sdy.mn
