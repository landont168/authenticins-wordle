#!/bin/sh
set -e

mkdir -p /app/data

export DATABASE_URL="sqlite:////app/data/wordle.db"

echo "Running database migrations..."
alembic upgrade head

echo "Starting server..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
