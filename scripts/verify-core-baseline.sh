#!/usr/bin/env bash

set -euo pipefail

API_URL="${LAHIM_API_URL:-http://localhost:3000}"
FRONTEND_URL="${LAHIM_FRONTEND_URL:-http://localhost:3001}"

fetch() {
  local url="$1"

  if command -v curl >/dev/null 2>&1; then
    curl -fsS "$url"
    return
  fi

  if command -v wget >/dev/null 2>&1; then
    wget -qO- "$url"
    return
  fi

  echo "Neither curl nor wget is available to verify ${url}." >&2
  exit 1
}

echo "Verifying LaHIM core API at ${API_URL}/health"
health_response="$(fetch "${API_URL}/health")"
printf '%s\n' "${health_response}"

echo "${health_response}" | grep -q '"status":"ok"' || {
  echo "Health endpoint did not report an ok status." >&2
  exit 1
}

echo "Verifying staff frontend at ${FRONTEND_URL}"
frontend_response="$(fetch "${FRONTEND_URL}")"
printf '%s\n' "${frontend_response}" | grep -qi '<html' || {
  echo "Frontend did not return an HTML document." >&2
  exit 1
}

cat <<EOF
Core baseline checks passed.

Next manual smoke step:
1. Open ${FRONTEND_URL}
2. Confirm the app loads without startup errors
3. Navigate to a core workflow page such as lab orders or specimens
4. Confirm the page can fetch API-backed data without crashing
EOF
