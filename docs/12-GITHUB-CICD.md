# СДЗН Платформ - GitHub CI/CD тохиргоо

## Ерөнхий мэдээлэл

GitHub Actions ашиглан автоматаар:
- Pull Request шалгах (test, lint, build)
- Production deploy хийх
- Security scan хийх
- Backup үүсгэх
- Database migration хийх

---

## Workflows

### 1. deploy.yml - Production Deploy
**Trigger**: `main` branch руу push хийхэд автоматаар ажиллана

**Үйлдлүүд**:
1. Backend, Frontend, Admin test хийх
2. SSH-ээр серверт холбогдох
3. Код татах, build хийх
4. Container deploy хийх
5. Health check хийх

**Гараар ажиллуулах**:
- GitHub > Actions > Deploy to Production > Run workflow
- Service сонгох: all, backend, frontend, admin

### 2. pr-check.yml - PR шалгалт
**Trigger**: Pull Request үүсгэхэд

**Үйлдлүүд**:
- Өөрчлөгдсөн файлуудыг илрүүлэх
- Backend: Go test, lint, vet
- Frontend: TypeScript check, lint, build
- Admin: TypeScript check, lint, build
- Docker build шалгах

### 3. backup.yml - Автомат нөөцлөлт
**Trigger**: Өдөр бүр 10:00 (Монгол цагаар)

**Үйлдлүүд**:
- PostgreSQL dump
- MinIO data backup
- Environment files backup
- 7 хоногоос хуучин backup устгах

### 4. security.yml - Security Scan
**Trigger**: Push, PR, долоо хоног бүр

**Үйлдлүүд**:
- Go: gosec, govulncheck
- Node.js: npm audit, Snyk
- Docker: Trivy scan
- Secret scanning: Gitleaks

### 5. database.yml - Database Operations
**Trigger**: Гараар (workflow_dispatch)

**Үйлдлүүд**:
- migrate-up: Migration ажиллуулах
- migrate-down: Migration буцаах
- migrate-status: Статус харах
- backup: Гараар backup хийх
- seed: Test data оруулах

---

## GitHub Secrets тохируулах

### Шаардлагатай Secrets

GitHub Repository > Settings > Secrets and variables > Actions

| Secret Name | Тайлбар | Жишээ |
|-------------|---------|-------|
| `SSH_PRIVATE_KEY` | Серверийн SSH private key | -----BEGIN OPENSSH PRIVATE KEY----- |
| `SNYK_TOKEN` | Snyk API token (optional) | xxxxxxxx-xxxx-xxxx-xxxx |

### SSH Key үүсгэх

```bash
# Local машин дээр
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# Private key хуулах (GitHub Secret-д оруулна)
cat ~/.ssh/github_actions

# Public key серверт нэмэх
cat ~/.ssh/github_actions.pub
```

### Сервер дээр public key нэмэх

```bash
# Серверт холбогдох
ssh root@206.189.146.159

# Public key нэмэх
echo "ssh-ed25519 AAAA... github-actions" >> ~/.ssh/authorized_keys
```

### GitHub Secret нэмэх

1. GitHub Repository руу орох
2. Settings > Secrets and variables > Actions
3. "New repository secret" дарах
4. Name: `SSH_PRIVATE_KEY`
5. Value: Private key-ийн бүрэн агуулга paste хийх
6. "Add secret" дарах

---

## Environments тохируулах

### Production Environment

1. GitHub > Settings > Environments
2. "New environment" > Name: `production`
3. Protection rules:
   - Required reviewers: 1+ (optional)
   - Wait timer: 0 minutes
4. Environment secrets (хэрэгтэй бол)

---

## Workflow ашиглах

### Автомат Deploy

```bash
# main branch руу push хийхэд автоматаар deploy болно
git checkout main
git merge feature/new-feature
git push origin main
```

### Гараар Deploy

1. GitHub > Actions
2. "Deploy to Production" workflow сонгох
3. "Run workflow" дарах
4. Service сонгох (all/backend/frontend/admin)
5. "Run workflow" дарах

### Database Migration

1. GitHub > Actions
2. "Database Operations" workflow
3. "Run workflow"
4. Operation сонгох:
   - migrate-up: Шинэ migration
   - migrate-down: Буцаах
   - backup: Нөөцлөлт

### Manual Backup

1. GitHub > Actions
2. "Scheduled Backup" workflow
3. "Run workflow"
4. backup_type: full/database/files

---

## Workflow Status Badge

README.md-д нэмэх:

```markdown
![Deploy](https://github.com/YOUR_ORG/sdyn-platform/actions/workflows/deploy.yml/badge.svg)
![Security](https://github.com/YOUR_ORG/sdyn-platform/actions/workflows/security.yml/badge.svg)
```

---

## Troubleshooting

### SSH холболт амжилтгүй

```
Error: Permission denied (publickey)
```

**Шийдэл**:
1. SSH_PRIVATE_KEY secret зөв эсэх шалгах
2. Серверт public key нэмсэн эсэх
3. SSH key format (ed25519 эсвэл rsa)

### Docker build амжилтгүй

```
Error: failed to solve: dockerfile parse error
```

**Шийдэл**:
1. Dockerfile syntax шалгах
2. Local дээр build хийж шалгах
3. Build context зөв эсэх

### Deploy дараа service ажиллахгүй

```
Health check failed!
```

**Шийдэл**:
1. Container logs шалгах
2. Environment variables шалгах
3. Network connectivity шалгах

### Workflow timeout

```
Error: The job exceeded the maximum time limit
```

**Шийдэл**:
1. Build cache ашиглах
2. Parallel jobs тохируулах
3. Timeout value нэмэгдүүлэх

---

## Best Practices

### Branch Protection

1. Settings > Branches > Add rule
2. Branch name pattern: `main`
3. Enable:
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date

### Commit Signing

```bash
# GPG key тохируулах
gpg --gen-key
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true
```

### Dependabot

`.github/dependabot.yml` үүсгэх:

```yaml
version: 2
updates:
  - package-ecosystem: "gomod"
    directory: "/backend"
    schedule:
      interval: "weekly"

  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"

  - package-ecosystem: "npm"
    directory: "/admin"
    schedule:
      interval: "weekly"

  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"
```

---

## Notifications

### Slack Integration

1. Slack App үүсгэх
2. Webhook URL авах
3. GitHub Secret нэмэх: `SLACK_WEBHOOK`
4. Workflow-д notification нэмэх:

```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1.24.0
  with:
    payload: |
      {
        "text": "Deploy completed!"
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Email Notifications

GitHub > Settings > Notifications > Actions

---
---

## Статус

| Workflow | Статус | Сүүлд ажилласан |
|----------|--------|-----------------|
| deploy.yml | ✅ Ажиллаж байна | 2026-01-28 |
| pr-check.yml | ✅ Бэлэн | - |
| backup.yml | ✅ Бэлэн | - |
| security.yml | ✅ Бэлэн | - |
| database.yml | ✅ Бэлэн | - |

### Secrets
| Secret | Статус |
|--------|--------|
| SSH_PRIVATE_KEY | ✅ Тохируулсан |
| SNYK_TOKEN | ⏳ Optional |

---

*Баримт бичгийн хувилбар: 1.1*
*Сүүлд шинэчилсэн: 2026-01-28*
