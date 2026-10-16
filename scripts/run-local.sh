#!/usr/bin/env bash

set -eu

PROJECT_ROOT=$(cd "$(dirname "$0")/.." && pwd)
BACKEND_PORT=${TESTME_BACKEND_PORT:-8001}
FRONTEND_PORT=${TESTME_FRONTEND_PORT:-3000}
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  trap - EXIT INT TERM
  if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [ -n "$FRONTEND_PID" ]; then
    wait "$FRONTEND_PID" 2>/dev/null || true
  fi
  if [ -n "$BACKEND_PID" ]; then
    wait "$BACKEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

if [ ! -x "$PROJECT_ROOT/backend/venv/bin/python" ]; then
  echo "Backend dependencies are missing. Run: make backend-install" >&2
  exit 1
fi

if [ ! -d "$PROJECT_ROOT/frontend/node_modules" ]; then
  echo "Frontend dependencies are missing. Run: make frontend-install" >&2
  exit 1
fi

if lsof -nP -iTCP:"$BACKEND_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Backend port $BACKEND_PORT is already in use. Set TESTME_BACKEND_PORT to another port." >&2
  exit 1
fi

if lsof -nP -iTCP:"$FRONTEND_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Frontend port $FRONTEND_PORT is already in use. Set TESTME_FRONTEND_PORT to another port." >&2
  exit 1
fi

echo "Applying Django migrations..."
(
  cd "$PROJECT_ROOT/backend"
  venv/bin/python manage.py migrate
)

echo "Starting Django at http://127.0.0.1:$BACKEND_PORT"
(
  cd "$PROJECT_ROOT/backend"
  exec venv/bin/python manage.py runserver "127.0.0.1:$BACKEND_PORT"
) &
BACKEND_PID=$!

echo "Starting Next.js at http://127.0.0.1:$FRONTEND_PORT"
(
  cd "$PROJECT_ROOT/frontend"
  API_URL="http://127.0.0.1:$BACKEND_PORT" \
    exec npm run dev -- --hostname 127.0.0.1 --port "$FRONTEND_PORT"
) &
FRONTEND_PID=$!

echo "TestMeGemini is starting. Press Ctrl-C to stop both services."

while kill -0 "$BACKEND_PID" 2>/dev/null && kill -0 "$FRONTEND_PID" 2>/dev/null; do
  sleep 1
done

status=0
if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
  wait "$BACKEND_PID" || status=$?
  echo "Django stopped unexpectedly (exit $status)." >&2
else
  wait "$FRONTEND_PID" || status=$?
  echo "Next.js stopped unexpectedly (exit $status)." >&2
fi

exit "$status"
