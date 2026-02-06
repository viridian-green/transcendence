#!/usr/bin/env bash
set -e

API="https://localhost:8443/api/auth/login"

assert_status () {
  payload=$1
  expected=$2

  status=$(curl -k -s -o /dev/null -w "%{http_code}" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    $API)

  if [ "$status" -ne "$expected" ]; then
    echo "Expected HTTP $expected, got $status for payload:"
    echo "$payload"
    exit 1
  fi
}

# Missing fields
assert_status '{}' 400
assert_status '{"username":"test"}' 400
assert_status '{"password":"1234"}' 400

# Empty fields
assert_status '{"username":"","password":"1234"}' 400
assert_status '{"username":"test","password":""}' 400

