#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  echo "Lipsește .env. Copiază .env.example în .env și completează valorile."
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

export STORAGE_PROVIDER="${STORAGE_PROVIDER:-local}"
export LOCAL_STORAGE_DIR="${LOCAL_STORAGE_DIR:-$ROOT_DIR/data/uploads}"

mkdir -p "$LOCAL_STORAGE_DIR"

echo "Pornesc API-ul pe portul ${API_PORT:-8080}..."
PORT="${API_PORT:-8080}" pnpm --filter @workspace/api-server run dev &
API_PID=$!

cleanup() {
  kill "$API_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Pornesc frontend-ul pe portul ${WEB_PORT:-5173}..."
PORT="${WEB_PORT:-5173}" BASE_PATH="${BASE_PATH:-/}" \
  API_PROXY_TARGET="${API_PROXY_TARGET:-http://localhost:${API_PORT:-8080}}" \
  pnpm --filter @workspace/viziune-urbana run dev