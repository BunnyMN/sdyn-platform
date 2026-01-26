#!/bin/bash
# ===========================================
# SDYN Platform - Server Setup Script
# Run as root on a fresh Ubuntu server
# ===========================================

set -e

echo "=========================================="
echo "SDYN Platform - Server Setup"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run as root"
    exit 1
fi

# ===========================================
# Phase 1: System Update & Packages
# ===========================================
log_info "Phase 1: Updating system and installing packages..."

apt update && apt upgrade -y

apt install -y \
    curl wget git vim htop ncdu tree unzip \
    software-properties-common apt-transport-https \
    ca-certificates gnupg lsb-release ufw fail2ban

# ===========================================
# Phase 2: Create sdyn user
# ===========================================
log_info "Phase 2: Creating sdyn user..."

if ! id "sdyn" &>/dev/null; then
    adduser --disabled-password --gecos "" sdyn
    usermod -aG sudo sdyn
    mkdir -p /home/sdyn/.ssh
    cp ~/.ssh/authorized_keys /home/sdyn/.ssh/ 2>/dev/null || true
    chown -R sdyn:sdyn /home/sdyn/.ssh
    chmod 700 /home/sdyn/.ssh
    chmod 600 /home/sdyn/.ssh/authorized_keys 2>/dev/null || true
    log_info "User sdyn created"
else
    log_info "User sdyn already exists"
fi

# ===========================================
# Phase 3: Firewall Configuration
# ===========================================
log_info "Phase 3: Configuring firewall..."

ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable

log_info "Firewall configured"

# ===========================================
# Phase 4: Fail2ban
# ===========================================
log_info "Phase 4: Configuring fail2ban..."

systemctl enable fail2ban
systemctl start fail2ban

log_info "Fail2ban configured"

# ===========================================
# Phase 5: Swap Memory
# ===========================================
log_info "Phase 5: Configuring swap memory..."

if [ ! -f /swapfile ]; then
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    log_info "Swap memory configured (4GB)"
else
    log_info "Swap already exists"
fi

# ===========================================
# Phase 6: Timezone
# ===========================================
log_info "Phase 6: Setting timezone..."

timedatectl set-timezone Asia/Ulaanbaatar

log_info "Timezone set to Asia/Ulaanbaatar"

# ===========================================
# Phase 7: System Limits
# ===========================================
log_info "Phase 7: Configuring system limits..."

if ! grep -q "* soft nofile 65535" /etc/security/limits.conf; then
    cat >> /etc/security/limits.conf << EOF
* soft nofile 65535
* hard nofile 65535
EOF
    log_info "System limits configured"
else
    log_info "System limits already configured"
fi

# ===========================================
# Phase 8: Docker Installation
# ===========================================
log_info "Phase 8: Installing Docker..."

if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    usermod -aG docker sdyn
    systemctl enable docker
    systemctl start docker
    log_info "Docker installed"
else
    log_info "Docker already installed"
fi

# ===========================================
# Phase 9: Docker Networks
# ===========================================
log_info "Phase 9: Creating Docker networks..."

docker network create sdyn-network 2>/dev/null || log_info "sdyn-network already exists"
docker network create traefik-public 2>/dev/null || log_info "traefik-public already exists"

# ===========================================
# Phase 10: Project Directory
# ===========================================
log_info "Phase 10: Creating project directory..."

mkdir -p /home/sdyn/{sdyn-platform,docs,backups,logs}
chown -R sdyn:sdyn /home/sdyn

log_info "Project directory created at /home/sdyn/sdyn-platform"

# ===========================================
# Complete
# ===========================================
echo ""
echo "=========================================="
echo -e "${GREEN}Server setup complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Copy project files to /home/sdyn/sdyn-platform/"
echo "2. Configure .env file"
echo "3. Run: cd /home/sdyn/sdyn-platform && docker compose up -d"
echo ""
echo "Server info:"
echo "- User: sdyn"
echo "- Project: /home/sdyn/sdyn-platform"
echo "- Timezone: Asia/Ulaanbaatar"
echo "- Swap: 4GB"
echo ""
