#!/usr/bin/env bash

set -eu

PROJECT_ROOT=$(cd "$(dirname "$0")/.." && pwd)
BACKEND_PORT=${TESTME_E2E_BACKEND_PORT:-18111}
DATABASE_PATH=${TESTME_E2E_DB:-${TMPDIR:-/tmp}/testmegemini-e2e.sqlite3}
DEVELOPMENT_DATABASE="$PROJECT_ROOT/backend/db.sqlite3"

case "$DATABASE_PATH" in
  ""|"/"|"$PROJECT_ROOT"|"$DEVELOPMENT_DATABASE")
    echo "Refusing unsafe E2E database path: $DATABASE_PATH" >&2
    exit 1
    ;;
esac

rm -f "$DATABASE_PATH" "$DATABASE_PATH-journal"

export DATABASE_ENGINE=django.db.backends.sqlite3
export DATABASE_NAME=$DATABASE_PATH
export DEBUG=True
export SECRET_KEY=testme-e2e-secret-key-that-is-longer-than-fifty-characters
export GEMINI_API_KEY=

cd "$PROJECT_ROOT/backend"
venv/bin/python manage.py migrate --noinput
exec venv/bin/python manage.py runserver --noreload "127.0.0.1:$BACKEND_PORT"
