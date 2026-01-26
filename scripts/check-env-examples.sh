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

# Collect keys and values from .env and .env.example (non-comment, non-empty lines)
  declare -A ENV_VALS EX_VALS
  mapfile -t env_lines < <(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$env"     || true)
  mapfile -t ex_lines  < <(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$example" || true)

  env_keys=()
  for line in "${env_lines[@]}"; do
    key="${line%%=*}"
    value="${line#*=}"
    env_keys+=("$key")
    ENV_VALS["$key"]="$value"
  done

  ex_keys=()
  for line in "${ex_lines[@]}"; do
    key="${line%%=*}"
    value="${line#*=}"
    ex_keys+=("$key")
    EX_VALS["$key"]="$value"
  done

  # Check for keys present in .env but missing in .env.example
  missing_in_example=()
  for k in "${env_keys[@]}"; do
    if [[ -z "${EX_VALS[$k]+set}" ]]; then
      missing_in_example+=("$k")
    fi
  done

  # Check for keys present in .env.example but missing in .env
  missing_in_env=()
  for k in "${ex_keys[@]}"; do
    if [[ -z "${ENV_VALS[$k]+set}" ]]; then
      missing_in_env+=("$k")
    fi
  done

  # Check for keys where the value differs between .env and .env.example
  differing=()
  for k in "${env_keys[@]}"; do
    if [[ -n "${EX_VALS[$k]+set}" ]] && [[ "${ENV_VALS[$k]}" != "${EX_VALS[$k]}" ]]; then
      differing+=("$k")
    fi
  done

  if ((${#missing_in_example[@]} > 0 || ${#missing_in_env[@]} > 0 || ${#differing[@]} > 0)); then
    echo "❌ FIX: Run make env and commit again"
    if ((${#missing_in_example[@]} > 0)); then
      echo "   Keys present in .env but missing in .env.example:"
      printf '     - %s\n' "${missing_in_example[@]}"
    fi
    if ((${#missing_in_env[@]} > 0)); then
      echo "   Keys present in .env.example but missing in .env:"
      printf '     - %s\n' "${missing_in_env[@]}"
    fi
    if ((${#differing[@]} > 0)); then
      echo "   Keys with different values (showing keys only, not values):"
      printf '     - %s\n' "${differing[@]}"
    fi
    ERRORS=1
  fi

  unset ENV_VALS
  unset EX_VALS
done < <(find "$ROOT_DIR" -name ".env" -print0)

if ((ERRORS == 0)); then
  echo "✅ .env and .env.example key sets are consistent."
  exit 0
fi

exit 1


