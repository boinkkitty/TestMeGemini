#!/usr/bin/env bash

set -eu

PROJECT_ROOT=$(cd "$(dirname "$0")/.." && pwd)
RUNNER="$PROJECT_ROOT/scripts/run-local.sh"
BACKEND_PORT=${TESTME_CHECK_BACKEND_PORT:-18101}
FRONTEND_PORT=${TESTME_CHECK_FRONTEND_PORT:-13101}
LOG_FILE=$(mktemp "${TMPDIR:-/tmp}/testme-local-check.XXXXXX.log")
RUNNER_PID=""

cleanup() {
  if [ -n "$RUNNER_PID" ] && kill -0 "$RUNNER_PID" 2>/dev/null; then
    kill "$RUNNER_PID" 2>/dev/null || true
    wait "$RUNNER_PID" 2>/dev/null || true
  fi
  rm -f "$LOG_FILE"
}
trap cleanup EXIT INT TERM

if [ ! -x "$RUNNER" ]; then
  echo "Local runner is missing or not executable: $RUNNER" >&2
  exit 1
fi

wait_for_url() {
  url=$1
  attempts=0
  while [ "$attempts" -lt 60 ]; do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    if ! kill -0 "$RUNNER_PID" 2>/dev/null; then
      echo "Local runner exited before $url became ready." >&2
      sed -n '1,240p' "$LOG_FILE" >&2
      return 1
    fi
    attempts=$((attempts + 1))
    sleep 1
  done
  echo "Timed out waiting for $url." >&2
  sed -n '1,240p' "$LOG_FILE" >&2
  return 1
}

TESTME_BACKEND_PORT=$BACKEND_PORT \
TESTME_FRONTEND_PORT=$FRONTEND_PORT \
  "$RUNNER" >"$LOG_FILE" 2>&1 &
RUNNER_PID=$!

wait_for_url "http://127.0.0.1:$BACKEND_PORT/api/v1/auth/csrf/"
wait_for_url "http://127.0.0.1:$FRONTEND_PORT/login"

kill "$RUNNER_PID"
wait "$RUNNER_PID" 2>/dev/null || true
RUNNER_PID=""

attempts=0
while [ "$attempts" -lt 20 ]; do
  if ! curl -fsS "http://127.0.0.1:$BACKEND_PORT/api/v1/auth/csrf/" >/dev/null 2>&1 \
    && ! curl -fsS "http://127.0.0.1:$FRONTEND_PORT/login" >/dev/null 2>&1; then
    echo "Local runtime check passed on backend $BACKEND_PORT and frontend $FRONTEND_PORT."
    exit 0
  fi
  attempts=$((attempts + 1))
  sleep 1
done

echo "Local runner left a server listening after shutdown." >&2
sed -n '1,240p' "$LOG_FILE" >&2
exit 1
