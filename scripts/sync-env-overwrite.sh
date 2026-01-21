#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
timestamp="$(date +%Y%m%d-%H%M%S)"

while IFS= read -r -d '' example; do
  env_file="${example%.example}"

  echo ">> Syncing (OVERWRITE) $env_file from $example"

  # If .env doesn't exist yet, just copy the example
  if [[ ! -f "$env_file" ]]; then
    cp "$example" "$env_file"
    echo "   Created $env_file (copied from example)"
    continue
  fi

  # Backup current .env
  backup="${env_file}.bak-${timestamp}"
  cp "$env_file" "$backup"
  echo "   Backup saved to $backup"

  # Read existing .env into a map
  declare -A OLD_ENV
  while IFS= read -r line; do
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      key="${BASH_REMATCH[1]}"
      value="${BASH_REMATCH[2]}"
      OLD_ENV["$key"]="$value"
    fi
  done < "$env_file"

  tmp="${env_file}.tmp"
  : > "$tmp"

  # Write example lines first; these define the canonical keys & values
  declare -A EXAMPLE_KEYS
  while IFS= read -r line; do
    echo "$line" >> "$tmp"
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)= ]]; then
      key="${BASH_REMATCH[1]}"
      EXAMPLE_KEYS["$key"]=1
    fi
  done < "$example"

  # Append keys that existed only in old .env but not in the example
  EXTRA_ADDED=0
  for key in "${!OLD_ENV[@]}"; do
    if [[ -z "${EXAMPLE_KEYS[$key]:-}" ]]; then
      echo "${key}=${OLD_ENV[$key]}" >> "$tmp"
      ((EXTRA_ADDED++))
    fi
  done

  mv "$tmp" "$env_file"

  if (( EXTRA_ADDED > 0 )); then
    echo "   Overwrote example keys; preserved $EXTRA_ADDED extra key(s) from old $env_file"
  else
    echo "   Overwrote example keys; no extra keys to preserve"
  fi

  unset OLD_ENV
  unset EXAMPLE_KEYS
done < <(find "$ROOT_DIR" -name ".env.example" -print0)


