#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ERRORS=0

while IFS= read -r -d '' env; do
  example="${env}.example"

  # Skip if there's no matching .env.example
  if [[ ! -f "$example" ]]; then
    continue
  fi

  # Collect keys from .env and .env.example (non-comment, non-empty lines)
  mapfile -t env_keys < <(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$env"      | cut -d= -f1 | sort -u || true)
  mapfile -t ex_keys  < <(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$example"  | cut -d= -f1 | sort -u || true)

  missing=()
  for k in "${env_keys[@]}"; do
    if ! printf '%s\n' "${ex_keys[@]}" | grep -qx "$k"; then
      missing+=("$k")
    fi
  done

  if ((${#missing[@]} > 0)); then
    echo "❌ ${example#$ROOT_DIR/} is missing keys present in ${env#$ROOT_DIR/}:"
    printf '   - %s\n' "${missing[@]}"
    ERRORS=1
  fi
done < <(find "$ROOT_DIR" -name ".env" -print0)

if ((ERRORS > 0)); then
  echo
  echo "Fix: add the missing keys (with safe placeholder values) to the corresponding .env.example files."
  exit 1
fi

echo "✅ .env and .env.example key sets are consistent."


