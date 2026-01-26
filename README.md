# СДЗН Платформ (SDYN Platform)

![Deploy](https://github.com/BunnyMN/sdyn-platform/actions/workflows/deploy.yml/badge.svg)
![Security](https://github.com/BunnyMN/sdyn-platform/actions/workflows/security.yml/badge.svg)

Социал Демократ Залуучуудын Нэгдлийн гишүүнчлэлийн удирдлагын систем.

## Live URLs

| Service | URL |
|---------|-----|
| Frontend | https://e-sdy.mn |
| Admin | https://admin.e-sdy.mn |
| API | https://api.e-sdy.mn |
| Auth | https://auth.e-sdy.mn |
| Monitoring | https://grafana.e-sdy.mn |

## Tech Stack

- **Backend**: Go 1.22 + Fiber
- **Frontend**: Next.js 14
- **Database**: PostgreSQL 16 + Redis 7
- **Auth**: Keycloak 24
- **Storage**: MinIO
- **Proxy**: Traefik v2.11 (Auto SSL)
- **Monitoring**: Grafana + Prometheus + Loki

## Documentation

Бүх баримт бичгүүд [docs/](./docs/) хавтаст байна.

| # | Document | Description |
|---|----------|-------------|
| 1 | [Танилцуулга](./docs/01-ТАНИЛЦУУЛГА.md) | System overview |
| 2 | [Суулгалт](./docs/02-СУУЛГАЛТ.md) | Installation guide |
| 3 | [API Guide](./docs/03-API-ГАРЫН-АВЛАГА.md) | REST API docs |
| 4 | [Admin Guide](./docs/04-АДМИН-ГАРЫН-АВЛАГА.md) | Admin portal |
| 5 | [Backup](./docs/05-НӨӨЦЛӨЛТ-СЭРГЭЭЛТ.md) | Backup & restore |
| 6 | [Security](./docs/06-АЮУЛГҮЙ-БАЙДАЛ.md) | Security guide |
| 7 | [Keycloak](./docs/07-KEYCLOAK-ТОХИРГОО.md) | Auth config |
| 8 | [Monitoring](./docs/08-МОНИТОРИНГ.md) | Grafana setup |
| 9 | [Troubleshooting](./docs/09-АЛДАА-ЗАСАХ.md) | Debug guide |
| 10 | [Development](./docs/10-ХӨГЖҮҮЛЭЛТ.md) | Dev setup |
| 11 | [Deploy](./docs/11-DEPLOY-ШИНЭЧЛЭЛТ.md) | Deploy guide |
| 12 | [CI/CD](./docs/12-GITHUB-CICD.md) | GitHub Actions |

## Quick Start

```bash
# Clone
git clone https://github.com/BunnyMN/sdyn-platform.git
cd sdyn-platform

# Setup environment
cp .env.example .env
# Edit .env with your values

# Start services
docker compose up -d

# Check status
docker compose ps
```

## License

Private - СДЗН
