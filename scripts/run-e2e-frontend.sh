#!/usr/bin/env bash

set -eu

PROJECT_ROOT=$(cd "$(dirname "$0")/.." && pwd)
BACKEND_PORT=${TESTME_E2E_BACKEND_PORT:-18111}
FRONTEND_PORT=${TESTME_E2E_FRONTEND_PORT:-13111}

cd "$PROJECT_ROOT/frontend"
export API_URL="http://127.0.0.1:$BACKEND_PORT"
exec npm run dev -- --hostname 127.0.0.1 --port "$FRONTEND_PORT"
