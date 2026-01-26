#!/bin/bash
# ===========================================
# SDYN Platform - Deploy Script
# ===========================================

set -e

cd /home/sdyn/sdyn-platform

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ===========================================
# Pre-deployment checks
# ===========================================
log_info "Running pre-deployment checks..."

# Check .env file exists
if [ ! -f .env ]; then
    log_error ".env file not found!"
    exit 1
fi

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
    log_error "Docker is not running!"
    exit 1
fi

# Check networks exist
docker network inspect sdyn-network > /dev/null 2>&1 || docker network create sdyn-network
docker network inspect traefik-public > /dev/null 2>&1 || docker network create traefik-public

# ===========================================
# Pull latest images
# ===========================================
log_info "Pulling latest images..."
docker compose pull

# ===========================================
# Build custom images
# ===========================================
log_info "Building custom images..."
docker compose build --no-cache

# ===========================================
# Deploy
# ===========================================
log_info "Deploying services..."

# Start infrastructure first
docker compose up -d postgres redis
log_info "Waiting for database to be ready..."
sleep 10

# Start Keycloak
docker compose up -d keycloak
log_info "Waiting for Keycloak to be ready..."
sleep 15

# Start remaining services
docker compose up -d

# ===========================================
# Post-deployment checks
# ===========================================
log_info "Running post-deployment checks..."

# Wait for services to start
sleep 10

# Check service health
log_info "Checking service health..."
docker compose ps

# Check Traefik
if curl -s -o /dev/null -w "%{http_code}" http://localhost/ping 2>/dev/null | grep -q "200\|404"; then
    log_info "Traefik is running"
else
    log_warn "Traefik might not be fully ready"
fi

# ===========================================
# Complete
# ===========================================
echo ""
log_info "Deployment completed!"
echo ""
echo "Services:"
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "Logs: docker compose logs -f [service_name]"
echo ""
