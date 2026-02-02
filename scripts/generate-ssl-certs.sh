#!/bin/bash

# Script to generate self-signed SSL certificates for all services
# For development use only

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Generating SSL certificates for all services...${NC}"

# Function to generate certificate
generate_cert() {
    local service_name=$1
    local cert_dir=$2
    local common_name=$3

    echo -e "${YELLOW}Generating certificate for ${service_name}...${NC}"

    mkdir -p "$cert_dir"

    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "${cert_dir}/${service_name}.key" \
        -out "${cert_dir}/${service_name}.crt" \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=${common_name}" \
        2>/dev/null

    echo -e "${GREEN}✓ Certificate generated for ${service_name}${NC}"
}

# Generate certificates for each service
generate_cert "nginx" "${PROJECT_ROOT}/nginx/ssl" "localhost"
generate_cert "api-gateway" "${PROJECT_ROOT}/api-gateway/ssl" "api-gateway"
generate_cert "user-service" "${PROJECT_ROOT}/services/user-service/ssl" "user"
generate_cert "game-service" "${PROJECT_ROOT}/services/game-service/ssl" "game"
generate_cert "chat-service" "${PROJECT_ROOT}/services/chat-service/ssl" "chat"
generate_cert "presence-service" "${PROJECT_ROOT}/services/presence-service/ssl" "presence"
generate_cert "notification-service" "${PROJECT_ROOT}/services/notification-service/ssl" "notification"
generate_cert "frontend" "${PROJECT_ROOT}/frontend/ssl" "frontend"

# Rename nginx certs to the expected names
if [ -f "${PROJECT_ROOT}/nginx/ssl/nginx.crt" ] && [ ! -f "${PROJECT_ROOT}/nginx/ssl/nginx.crt.bak" ]; then
    mv "${PROJECT_ROOT}/nginx/ssl/nginx.crt" "${PROJECT_ROOT}/nginx/ssl/nginx.crt.bak" 2>/dev/null || true
fi
if [ -f "${PROJECT_ROOT}/nginx/ssl/nginx.key" ] && [ ! -f "${PROJECT_ROOT}/nginx/ssl/nginx.key.bak" ]; then
    mv "${PROJECT_ROOT}/nginx/ssl/nginx.key" "${PROJECT_ROOT}/nginx/ssl/nginx.key.bak" 2>/dev/null || true
fi

# Generate nginx certs with correct names
generate_cert "nginx" "${PROJECT_ROOT}/nginx/ssl" "localhost"
mv "${PROJECT_ROOT}/nginx/ssl/nginx.crt" "${PROJECT_ROOT}/nginx/ssl/nginx.crt.tmp"
mv "${PROJECT_ROOT}/nginx/ssl/nginx.key" "${PROJECT_ROOT}/nginx/ssl/nginx.key.tmp"
mv "${PROJECT_ROOT}/nginx/ssl/nginx.crt.tmp" "${PROJECT_ROOT}/nginx/ssl/nginx.crt"
mv "${PROJECT_ROOT}/nginx/ssl/nginx.key.tmp" "${PROJECT_ROOT}/nginx/ssl/nginx.key"

echo -e "${GREEN}All SSL certificates generated successfully!${NC}"
echo -e "${YELLOW}Note: These are self-signed certificates for development use only.${NC}"

