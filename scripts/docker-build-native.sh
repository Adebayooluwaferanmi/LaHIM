#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEFAULT_NATIVE_DIR="/tmp/lahim-native-${USER:-$(id -u)}"
NATIVE_DIR="${LAHIM_NATIVE_DIR:-${DEFAULT_NATIVE_DIR}}"
DOCKER_BIN="${LAHIM_DOCKER_BIN:-docker}"
DOCKER_BUILDKIT_VALUE="${LAHIM_DOCKER_BUILDKIT:-1}"
COMPOSE_PROGRESS="${LAHIM_DOCKER_PROGRESS:-plain}"

ensure_buildkit_enabled() {
  if [ "${DOCKER_BUILDKIT_VALUE}" = "0" ]; then
    cat >&2 <<EOF
BuildKit must be enabled for native Docker builds in this repo.
The current Dockerfiles use RUN --mount=type=cache, which is only supported with BuildKit.
Retry without LAHIM_DOCKER_BUILDKIT=0, or set LAHIM_DOCKER_BUILDKIT=1.
EOF
    exit 1
  fi
}

ensure_native_dir() {
  mkdir -p "${NATIVE_DIR}"

  if [ ! -w "${NATIVE_DIR}" ]; then
    echo "Native workspace is not writable: ${NATIVE_DIR}" >&2
    ls -ld "${NATIVE_DIR}" >&2 || true
    cat >&2 <<EOF
Set LAHIM_NATIVE_DIR to a writable path or remove/chown the existing directory, then retry.
EOF
    exit 1
  fi
}

if [ "${1:-}" = "--help" ]; then
  cat <<EOF
Usage: ./scripts/docker-build-native.sh [service...]

Builds the boot-first LaHIM images from a Linux-native copy of the repository.
Defaults to: lahim-server staff-frontend

Supported environment variables:
  LAHIM_NATIVE_DIR       Target native workspace (default: /tmp/lahim-native-\$USER)
  LAHIM_DOCKER_BIN       Docker CLI to use (default: docker)
  LAHIM_DOCKER_BUILDKIT  BuildKit toggle, 1 or 0 (default: 1)
  LAHIM_DOCKER_PROGRESS  Compose progress mode (default: plain)
EOF
  exit 0
fi

if [ "$#" -eq 0 ]; then
  SERVICES=("lahim-server" "staff-frontend")
else
  SERVICES=("$@")
fi

echo "Syncing repo to Linux-native workspace: ${NATIVE_DIR}"
ensure_buildkit_enabled
ensure_native_dir

rsync -a --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude 'packages/*/node_modules' \
  --exclude 'backups' \
  "${ROOT_DIR}/" "${NATIVE_DIR}/"

echo "Building services from ${NATIVE_DIR}: ${SERVICES[*]}"
cd "${NATIVE_DIR}"
DOCKER_BUILDKIT="${DOCKER_BUILDKIT_VALUE}" \
  "${DOCKER_BIN}" compose --progress "${COMPOSE_PROGRESS}" build "${SERVICES[@]}"
