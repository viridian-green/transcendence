#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECRETS_DIR="${ROOT_DIR}/secrets"
POSTGRES_SECRET_FILE="${SECRETS_DIR}/postgres_password"
JWT_SECRET_FILE="${SECRETS_DIR}/jwt_secret"

mkdir -p "${SECRETS_DIR}"

echo "==> Ensuring secrets exist in ${SECRETS_DIR}"

# Generate Postgres password (file-based) if missing
if [ ! -f "${POSTGRES_SECRET_FILE}" ]; then
  echo "  - Creating postgres_password secret..."
  # 32 random bytes, base64-encoded
  head -c 32 /dev/urandom | base64 > "${POSTGRES_SECRET_FILE}"
  chmod 600 "${POSTGRES_SECRET_FILE}" || true
else
  echo "  - postgres_password already exists, leaving as-is."
fi

# Generate JWT secret if missing
if [ ! -f "${JWT_SECRET_FILE}" ]; then
  echo "  - Creating jwt_secret..."
  # 64 random bytes, base64-encoded
  head -c 64 /dev/urandom | base64 > "${JWT_SECRET_FILE}"
  chmod 600 "${JWT_SECRET_FILE}" || true
else
  echo "  - jwt_secret already exists, leaving as-is."
fi

echo "==> Secrets setup complete."

