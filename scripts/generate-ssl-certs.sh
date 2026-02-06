#!/bin/bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=== Generating SSL certificates ==="

generate_cert() {
  local name=$1
  local dir=$2
  local cn=$3

  mkdir -p "$dir"

  if [ -f "${dir}/${name}.crt" ] && [ -f "${dir}/${name}.key" ]; then
    echo "  ✓ ${name} (exists)"
  else
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout "${dir}/${name}.key" \
      -out "${dir}/${name}.crt" \
      -subj "/C=US/ST=State/L=City/O=Organization/CN=${cn}" \
      2>/dev/null
    echo "  + ${name} (generated)"
  fi
}

generate_cert "nginx"                "${PROJECT_ROOT}/nginx/ssl"                       "localhost"
generate_cert "api-gateway"          "${PROJECT_ROOT}/api-gateway/ssl"                 "api-gateway"
generate_cert "user-service"         "${PROJECT_ROOT}/services/user-service/ssl"       "user"
generate_cert "game-service"         "${PROJECT_ROOT}/services/game-service/ssl"       "game"
generate_cert "chat-service"         "${PROJECT_ROOT}/services/chat-service/ssl"       "chat"
generate_cert "presence-service"     "${PROJECT_ROOT}/services/presence-service/ssl"   "presence"
generate_cert "notification-service" "${PROJECT_ROOT}/services/notification-service/ssl" "notification"
generate_cert "frontend"             "${PROJECT_ROOT}/frontend/ssl"                    "frontend"

echo ""
