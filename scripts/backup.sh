#!/bin/bash
# ===========================================
# SDYN Platform - Backup Script
# Run as cron job: 0 2 * * * /home/sdyn/sdyn-platform/scripts/backup.sh
# ===========================================

set -e

# Configuration
BACKUP_DIR="/home/sdyn/backups"
RETENTION_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)
POSTGRES_CONTAINER="sdyn-postgres"
MINIO_CONTAINER="sdyn-minio"

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"; }

# Create backup directory
mkdir -p "$BACKUP_DIR"

# ===========================================
# PostgreSQL Backup
# ===========================================
log "Starting PostgreSQL backup..."

POSTGRES_BACKUP="$BACKUP_DIR/postgres_$DATE.sql.gz"

docker exec $POSTGRES_CONTAINER pg_dumpall -U sdyn_user | gzip > "$POSTGRES_BACKUP"

log "PostgreSQL backup completed: $POSTGRES_BACKUP"

# ===========================================
# MinIO Backup (optional - if data is critical)
# ===========================================
log "Starting MinIO backup..."

MINIO_BACKUP="$BACKUP_DIR/minio_$DATE.tar.gz"

# Backup MinIO data directory
docker run --rm \
    --volumes-from $MINIO_CONTAINER \
    -v "$BACKUP_DIR:/backup" \
    alpine tar czf "/backup/minio_$DATE.tar.gz" /data 2>/dev/null || log "MinIO backup skipped (no data)"

log "MinIO backup completed: $MINIO_BACKUP"

# ===========================================
# Environment Backup
# ===========================================
log "Backing up environment files..."

ENV_BACKUP="$BACKUP_DIR/env_$DATE.tar.gz"
tar czf "$ENV_BACKUP" -C /home/sdyn/sdyn-platform .env traefik/acme.json 2>/dev/null || true

log "Environment backup completed: $ENV_BACKUP"

# ===========================================
# Cleanup old backups
# ===========================================
log "Cleaning up old backups (older than $RETENTION_DAYS days)..."

find "$BACKUP_DIR" -name "*.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.sql" -mtime +$RETENTION_DAYS -delete

# ===========================================
# Summary
# ===========================================
log "Backup completed successfully!"
log "Backup location: $BACKUP_DIR"
log "Files:"
ls -lh "$BACKUP_DIR"/*"$DATE"* 2>/dev/null || true

# ===========================================
# Remote backup (optional - configure as needed)
# ===========================================
# Uncomment and configure to send backups to remote storage
# aws s3 sync $BACKUP_DIR s3://your-bucket/sdyn-backups/
# rclone sync $BACKUP_DIR remote:sdyn-backups/
