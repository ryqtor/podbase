#!/usr/bin/env bash
set -e

echo "🔄 Resetting database..."
docker compose exec db psql -U lenny -d lenny_growth -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; CREATE EXTENSION IF NOT EXISTS vector;"
echo "🌱 Seeding fresh transcripts..."
docker compose exec backend python scripts/seed_transcripts.py
echo "✅ Database reset and seeded!"
