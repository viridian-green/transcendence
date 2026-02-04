#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECRETS_DIR="$ROOT_DIR/secrets"
CERTS_DIR="$ROOT_DIR/nginx/ssl"

JWT_SECRET_FILE="$SECRETS_DIR/jwt_secret"
POSTGRES_PASSWORD_FILE="$SECRETS_DIR/postgres_password"
COOKIE_SECRET_FILE="$SECRETS_DIR/cookie_secret"

echo "🔧 Transcendence setup starting..."
echo "Root: $ROOT_DIR"
echo

# --------------------------------------------------
# 1️⃣ Create secrets directory
# --------------------------------------------------
mkdir -p "$SECRETS_DIR"

# --------------------------------------------------
# 2️⃣ JWT secret
# --------------------------------------------------
if [ -n "$JWT_SECRET" ]; then
  echo "→ Using JWT_SECRET from environment"
  echo -n "$JWT_SECRET" > "$JWT_SECRET_FILE"
elif [ -f "$JWT_SECRET_FILE" ]; then
  echo "✓ jwt_secret already exists"
else
  echo "→ Generating jwt_secret"
  openssl rand -hex 32 > "$JWT_SECRET_FILE"
fi

chmod 600 "$JWT_SECRET_FILE"

# --------------------------------------------------
# 3️⃣ Postgres password
# --------------------------------------------------
if [ -n "$POSTGRES_PASSWORD" ]; then
  echo "→ Using POSTGRES_PASSWORD from environment"
  echo -n "$POSTGRES_PASSWORD" > "$POSTGRES_PASSWORD_FILE"
elif [ -f "$POSTGRES_PASSWORD_FILE" ]; then
  echo "✓ postgres_password already exists"
else
  echo "→ Generating postgres_password"
  openssl rand -hex 24 > "$POSTGRES_PASSWORD_FILE"
fi

chmod 600 "$POSTGRES_PASSWORD_FILE"

# --------------------------------------------------
# 4️⃣ Cookie secret
# --------------------------------------------------
if [ -n "$COOKIE_SECRET" ]; then
  echo "→ Using COOKIE_SECRET from environment"
  echo -n "$COOKIE_SECRET" > "$COOKIE_SECRET_FILE"
elif [ -f "$COOKIE_SECRET_FILE" ]; then
  echo "✓ cookie_secret already exists"
else
  echo "→ Generating cookie_secret"
  openssl rand -hex 32 > "$COOKIE_SECRET_FILE"
fi

chmod 600 "$COOKIE_SECRET_FILE"

# --------------------------------------------------
# 5️⃣ Summary
# --------------------------------------------------
echo
echo "✅ Setup complete"
echo
echo "Generated files:"
echo "  - $JWT_SECRET_FILE"
echo "  - $POSTGRES_PASSWORD_FILE"
echo "  - $COOKIE_SECRET_FILE"
echo
echo "You can now run: make up"
