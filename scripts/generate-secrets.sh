#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECRETS_DIR="$ROOT_DIR/secrets"

JWT_SECRET_FILE="$SECRETS_DIR/jwt_secret"
POSTGRES_PASSWORD_FILE="$SECRETS_DIR/postgres_password"
COOKIE_SECRET_FILE="$SECRETS_DIR/cookie_secret"

echo "=== Generating secrets ==="

mkdir -p "$SECRETS_DIR"

# JWT secret
if [ -n "$JWT_SECRET" ]; then
  echo "  → jwt_secret (from environment)"
  echo -n "$JWT_SECRET" > "$JWT_SECRET_FILE"
elif [ -f "$JWT_SECRET_FILE" ]; then
  echo "  ✓ jwt_secret (exists)"
else
  echo "  + jwt_secret (generated)"
  openssl rand -hex 32 > "$JWT_SECRET_FILE"
fi
chmod 600 "$JWT_SECRET_FILE"

# Postgres password
if [ -n "$POSTGRES_PASSWORD" ]; then
  echo "  → postgres_password (from environment)"
  echo -n "$POSTGRES_PASSWORD" > "$POSTGRES_PASSWORD_FILE"
elif [ -f "$POSTGRES_PASSWORD_FILE" ]; then
  echo "  ✓ postgres_password (exists)"
else
  echo "  + postgres_password (generated)"
  openssl rand -hex 24 > "$POSTGRES_PASSWORD_FILE"
fi
chmod 600 "$POSTGRES_PASSWORD_FILE"

# Cookie secret
if [ -n "$COOKIE_SECRET" ]; then
  echo "  → cookie_secret (from environment)"
  echo -n "$COOKIE_SECRET" > "$COOKIE_SECRET_FILE"
elif [ -f "$COOKIE_SECRET_FILE" ]; then
  echo "  ✓ cookie_secret (exists)"
else
  echo "  + cookie_secret (generated)"
  openssl rand -hex 32 > "$COOKIE_SECRET_FILE"
fi
chmod 600 "$COOKIE_SECRET_FILE"

echo ""
