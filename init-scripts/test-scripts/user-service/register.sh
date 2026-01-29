#!/usr/bin/env bash
set -e

API_URL="http://127.0.0.1:3000/api/auth/register"

#echo "▶ Running user-service register route tests"

fail() {
  echo "❌ $1"
  exit 1
}

assert_status() {
  local payload=$1
  local expected=$2

#   echo
#   echo "▶ Payload:"
#   echo "$payload"
#   echo "▶ Response:"

  response=$(curl -i \
    -H "Content-Type: application/json" \
    -d "$payload" \
    "$API_URL")

  status=$(echo "$response" | head -n 1 | awk '{print $2}')

#   echo "$response"

  if [ "$status" != "$expected" ]; then
    fail "Expected HTTP $expected, got $status"
  fi
}


# -------------------------
# ❌ Validation failures
# -------------------------

# Missing email
assert_status '{"username":"test","password":"42_Transcendenc"}' 400

# Empty email
assert_status '{"username":"test","password":"42_Transcendenc","email":""}' 400

# Missing username
assert_status '{"password":"42_Transcendenc","email":"test@test.com"}' 400

# Empty username
assert_status '{"username":"","password":"42_Transcendenc","email":"test@test.com"}' 400

# Missing password
assert_status '{"username":"test","email":"test@test.com"}' 400

# Weak password
assert_status '{"username":"test","password":"1234","email":"test@test.com"}' 400

# -------------------------
# ✅ Success case (unique)
# -------------------------

UNIQ=$(printf "%04x" $RANDOM)


assert_status "{
  \"username\":\"Val1dr_$UNIQ\",
  \"password\":\"42_Transcendenc\",
  \"email\":\"valid_$UNIQ@test.com\"
}" 201

#echo "✅ Register route tests passed"
