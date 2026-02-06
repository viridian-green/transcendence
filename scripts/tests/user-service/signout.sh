#!/usr/bin/env bash
set -e

API_URL="https://localhost:8443/api/auth"
COOKIE_JAR="cookies.txt"

#echo "▶ Running user-service signout route tests"

fail() {
  echo "❌ $1"
  exit 1
}

assert_status() {
  local method=$1
  local url=$2
  local expected=$3

  status=$(curl -k -s -o /dev/null -w "%{http_code}" \
    -X "$method" \
    -b "$COOKIE_JAR" \
    "$url")

  if [ "$status" != "$expected" ]; then
    fail "Expected HTTP $expected, got $status for $method $url"
  fi
}

# -------------------------
# 1️⃣ Register a user
# -------------------------

UNIQ=$(printf "%04x" $RANDOM)

curl -k -s -c "$COOKIE_JAR" \
  -X POST "$API_URL/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\":\"Signout_$UNIQ\",
    \"password\":\"42_Transcendenc\",
    \"email\":\"signout_$UNIQ@test.com\"
  }" >/dev/null

# -------------------------
# 2️⃣ Login (sets cookie)
# -------------------------

curl -k -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
  -X POST "$API_URL/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\":\"Signout_$UNIQ\",
    \"password\":\"42_Transcendenc\"
  }" >/dev/null

# -------------------------
# 3️⃣ Signout
# -------------------------

assert_status POST "$API_URL/signout" 200

# -------------------------
# 4️⃣ Protected route should fail
# -------------------------

# assert_status GET "$API_URL/me" 401 //not ready yet!

#echo "✅ Signout route tests passed"

