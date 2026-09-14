.PHONY: help build up down restart logs seed test lint clean

help:
	@echo "Lenny Growth Assistant - Commands:"
	@echo "  make build       - Build all Docker containers"
	@echo "  make up          - Start all services (db, backend, frontend)"
	@echo "  make up-ollama   - Start all services including local Ollama"
	@echo "  make down        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make logs        - Tail logs from all containers"
	@echo "  make seed        - Ingest sample transcripts into the database"
	@echo "  make test        - Run backend test suite"
	@echo "  make lint        - Run linting on backend and frontend"
	@echo "  make clean       - Remove all containers, volumes, and caches"

build:
	docker compose build

up:
	docker compose up -d

up-ollama:
	docker compose --profile with-ollama up -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

seed:
	docker compose exec backend python scripts/seed_transcripts.py

test:
	docker compose exec backend pytest ../tests -v --cov=app

lint:
	docker compose exec backend ruff check app/
	cd frontend && npm run lint

clean:
	docker compose down -v --remove-orphans
