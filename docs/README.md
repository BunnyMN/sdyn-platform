# СДЗН Платформ - Баримт бичгүүд

## Баримт бичгийн жагсаалт

| # | Файл | Тайлбар |
|---|------|---------|
| 1 | [01-ТАНИЛЦУУЛГА.md](./01-ТАНИЛЦУУЛГА.md) | Системийн танилцуулга, архитектур |
| 2 | [02-СУУЛГАЛТ.md](./02-СУУЛГАЛТ.md) | Серверийн бэлтгэл, суулгалтын алхамууд |
| 3 | [03-API-ГАРЫН-АВЛАГА.md](./03-API-ГАРЫН-АВЛАГА.md) | REST API endpoint-үүд, жишээнүүд |
| 4 | [04-АДМИН-ГАРЫН-АВЛАГА.md](./04-АДМИН-ГАРЫН-АВЛАГА.md) | Админ портал ашиглах заавар |
| 5 | [05-НӨӨЦЛӨЛТ-СЭРГЭЭЛТ.md](./05-НӨӨЦЛӨЛТ-СЭРГЭЭЛТ.md) | Backup, restore процедур |
| 6 | [06-АЮУЛГҮЙ-БАЙДАЛ.md](./06-АЮУЛГҮЙ-БАЙДАЛ.md) | Security тохиргоо, checklist |
| 7 | [07-KEYCLOAK-ТОХИРГОО.md](./07-KEYCLOAK-ТОХИРГОО.md) | Keycloak realm, client, IdP тохиргоо |
| 8 | [08-МОНИТОРИНГ.md](./08-МОНИТОРИНГ.md) | Grafana, Prometheus, Loki ашиглах |
| 9 | [09-АЛДАА-ЗАСАХ.md](./09-АЛДАА-ЗАСАХ.md) | Troubleshooting guide |
| 10 | [10-ХӨГЖҮҮЛЭЛТ.md](./10-ХӨГЖҮҮЛЭЛТ.md) | Developer guide |
| 11 | [11-DEPLOY-ШИНЭЧЛЭЛТ.md](./11-DEPLOY-ШИНЭЧЛЭЛТ.md) | Deploy, update процедур |
| 12 | [12-GITHUB-CICD.md](./12-GITHUB-CICD.md) | GitHub Actions CI/CD тохиргоо |

---

## Түргэн холбоосууд

### URL-ууд

| Сервис | URL | Тайлбар |
|--------|-----|---------|
| Frontend | https://e-sdy.mn | Гишүүний портал |
| Admin | https://admin.e-sdy.mn | Админ портал |
| API | https://api.e-sdy.mn | REST API |
| Keycloak | https://auth.e-sdy.mn | Authentication |
| Grafana | https://grafana.e-sdy.mn | Monitoring |
| MinIO | https://minio.e-sdy.mn | Object storage |

### Түгээмэл команд

```bash
# Container статус
docker compose ps

# Logs харах
docker compose logs -f <service>

# Restart
docker compose restart <service>

# Rebuild
docker compose build <service>
docker compose up -d <service>
```

### Нэвтрэх мэдээлэл

| Сервис | Хаана |
|--------|-------|
| Keycloak Admin | .env > KEYCLOAK_ADMIN_PASSWORD |
| Grafana | .env > GRAFANA_ADMIN_PASSWORD |
| PostgreSQL | .env > POSTGRES_PASSWORD |
| MinIO | .env > MINIO_ROOT_PASSWORD |

---

## Холбоо барих

Асуудал гарвал:
1. [09-АЛДАА-ЗАСАХ.md](./09-АЛДАА-ЗАСАХ.md) харах
2. Log хадгалах: `docker compose logs > logs.txt`
3. Техникийн багт холбогдох

---
*Сүүлд шинэчилсэн: 2026-01-26*
