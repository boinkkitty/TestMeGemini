.PHONY: help \
        backend-install backend-migrate backend-run \
        frontend-install frontend-run-dev frontend-build frontend-run-prod \
        docker-up docker-down docker-build docker-logs \
        clean

help:
	@echo "Local (no Docker):"
	@echo "  backend-install   Create python venv and install backend requirements"
	@echo "  backend-migrate   Run Django migrations"
	@echo "  backend-run       Run Django dev server"
	@echo "  frontend-install  Install frontend dependencies"
	@echo "  frontend-run-dev  Run Next.js dev server"
	@echo "  frontend-build    Build Next.js for production"
	@echo "  frontend-run-prod Run Next.js production server"
	@echo ""
	@echo "Docker:"
	@echo "  docker-up         Build images (if needed) and start all services"
	@echo "  docker-build      Force rebuild images and start all services"
	@echo "  docker-down       Stop and remove containers"
	@echo "  docker-logs       Tail logs from all services"
	@echo ""
	@echo "  clean             Remove backend venv and node_modules"

# ── Local ────────────────────────────────────────────────────────────────────

backend-install:
	@if [ ! -d backend/venv ]; then \
	  cd backend && python3 -m venv venv; \
	fi
	cd backend && venv/bin/pip install -r requirements.txt

backend-migrate:
	cd backend && venv/bin/python manage.py makemigrations
	cd backend && venv/bin/python manage.py migrate

backend-run:
	cd backend && venv/bin/python manage.py runserver

frontend-install:
	cd frontend && npm install

frontend-run-dev:
	cd frontend && npm run dev

frontend-build:
	cd frontend && npm run build

frontend-run-prod:
	cd frontend && npm start

# ── Docker ───────────────────────────────────────────────────────────────────

docker-up:
	docker compose up

docker-build:
	docker compose up --build

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

# ── Misc ─────────────────────────────────────────────────────────────────────

clean:
	rm -rf backend/venv frontend/node_modules
