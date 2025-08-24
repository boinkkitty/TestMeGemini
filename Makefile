.PHONY: help backend-install backend-migrate backend-run frontend-install frontend-run-dev frontend-build frontend-run-prod clean

help:
	@echo "Available targets:"
	@echo "  backend-install   Create python venv and Install backend requirements"
	@echo "  backend-migrate   Run Django migrations"
	@echo "  backend-run       Run Django dev server"
	@echo "  frontend-install  Install frontend dependencies"
	@echo "  frontend-run-dev      Run Next.js dev server"
	@echo "  frontend-build    Build Next.js for production"
	@echo "  frontend-run-prod Run Next.js production server"
	@echo "  clean             Remove backend venv and node_modules"

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

clean:
	rm -rf backend/venv frontend/node_modules
