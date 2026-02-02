#!/usr/bin/env bash
set -e

API_BASE="https://localhost:3000/api/users"
COOKIE_JAR="cookies.txt"

#echo "▶ Running user-service me route tests"

fail() {
  echo "❌ $1"
  exit 1
}

assert_status() {
  local method=$1
  local url=$2
  local payload=$3
  local expected=$4
  local use_cookie=${5:-false}

  if [ "$use_cookie" = true ]; then
    status=$(curl -k -s -o /dev/null -w "%{http_code}" \
      -X "$method" \
      -H "Content-Type: application/json" \
      -b "$COOKIE_JAR" \
      -d "$payload" \
      "$url")
  else
    status=$(curl -k -s -o /dev/null -w "%{http_code}" \
      -X "$method" \
      -H "Content-Type: application/json" \
      -d "$payload" \
      "$url")
  fi

  if [ "$status" != "$expected" ]; then
    fail "Expected HTTPS $expected, got $status for payload: $payload"
  fi
}

# -------------------------
# Setup: register + login
# -------------------------

UNIQ=$(printf "%04x" $RANDOM)
USERNAME="Updt_$UNIQ"
PASSWORD="42_Transcendenc"
EMAIL="updt_$UNIQ@test.com"

#echo "▶ Registering test user"

curl -k -s -X POST "$API_BASE/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\":\"$USERNAME\",
    \"password\":\"$PASSWORD\",
    \"email\":\"$EMAIL\"
  }" > /dev/null

#echo "▶ Logging in (saving cookie)"

curl -k -s -c -b "$COOKIE_JAR" \
  -X POST "$API_BASE/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\":\"$USERNAME\",
    \"password\":\"$PASSWORD\"
  }" > /dev/null

#echo "▶ Cookies after login:"
#cat "$COOKIE_JAR"

# -------------------------
# ❌ Unauthorized (no cookie)
# -------------------------

assert_status PUT "$API_BASE/me" '{"username":"hacker"}' 401 false

# -------------------------
# ❌ Validation failures
# -------------------------

# Empty username
assert_status PUT "$API_BASE/me" '{"username":""}' 400 true

# Username too long (>15)
assert_status PUT "$API_BASE/me" '{"username":"this_username_is_way_too_long"}' 400 true

# Weak password
assert_status PUT "$API_BASE/me" '{"password":"1234"}' 400 true

# -------------------------
# ✅ Success case
# -------------------------

NEW_USERNAME="${USERNAME}_x"
NEW_USERNAME="${NEW_USERNAME:0:15}"

assert_status PUT "$API_BASE/me" "{
  \"username\":\"$NEW_USERNAME\"
}" 200 true

#echo "✅ Update route tests passed"
