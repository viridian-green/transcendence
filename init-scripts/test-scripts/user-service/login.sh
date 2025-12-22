#!/usr/bin/env bash
set -e

API="http://localhost:3000/api/users/login"

assert_status () {
  payload=$1
  expected=$2

  status=$(curl -s -o /dev/null -w "%{http_code}" \
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
