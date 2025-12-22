#!/usr/bin/env bash
set -e

API_BASE="http://localhost:3000/api/users"

echo "▶ Running user-service update route tests"

fail() {
  echo "❌ $1"
  exit 1
}

assert_status() {
  local method=$1
  local url=$2
  local payload=$3
  local expected=$4
  local auth=${5:-}

  if [ -n "$auth" ]; then
    status=$(curl -s -o /dev/null -w "%{http_code}" \
      -X "$method" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $auth" \
      -d "$payload" \
      "$url")
  else
    status=$(curl -s -o /dev/null -w "%{http_code}" \
      -X "$method" \
      -H "Content-Type: application/json" \
      -d "$payload" \
      "$url")
  fi

  if [ "$status" != "$expected" ]; then
    fail "Expected HTTP $expected, got $status for payload: $payload"
  fi
}

# -------------------------
# Setup: register + login
# -------------------------

UNIQ=$(printf "%04x" $RANDOM)
USERNAME="Updt_$UNIQ"           # <= 15 chars
PASSWORD="42_Transcendenc"
EMAIL="updt_$UNIQ@test.com"

echo "▶ Registering test user"

curl -s -X POST "$API_BASE/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\":\"$USERNAME\",
    \"password\":\"$PASSWORD\",
    \"email\":\"$EMAIL\"
  }" > /dev/null

echo "▶ Logging in"

LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\":\"$USERNAME\",
    \"password\":\"$PASSWORD\"
  }")

TOKEN=$(echo "$LOGIN_RESPONSE" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')

[ -z "$TOKEN" ] && fail "Login failed, no token returned"

# -------------------------
# ❌ Unauthorized
# -------------------------

assert_status PUT "$API_BASE/me" '{"username":"hacker"}' 401

# -------------------------
# ❌ Validation failures
# -------------------------

# Empty username
assert_status PUT "$API_BASE/me" '{"username":""}' 400 "$TOKEN"

# Username too long (>15)
assert_status PUT "$API_BASE/me" '{"username":"this_username_is_way_too_long"}' 400 "$TOKEN"

# Weak password
assert_status PUT "$API_BASE/me" '{"password":"1234"}' 400 "$TOKEN"

# -------------------------
# ✅ Success cases
# -------------------------

NEW_USERNAME="${USERNAME}_x"
NEW_USERNAME="${NEW_USERNAME:0:15}"

assert_status PUT "$API_BASE/me" "{
  \"username\":\"$NEW_USERNAME\"
}" 200 "$TOKEN"

echo "✅ Update route tests passed"
