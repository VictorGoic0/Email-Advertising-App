#!/bin/bash
set -e  # Exit on error

echo "====================================="
echo "Starting Railway Deployment Process"
echo "====================================="

# Run database migrations
echo ""
echo "Step 1: Running database migrations..."
alembic upgrade head
echo "✓ Migrations complete"

# Seed database - DISABLED (already seeded on first deploy)
# IMPORTANT: Uncomment lines below if you need to seed again
# -----------------------------------------------------------------------------
# echo ""
# echo "Step 2: Seeding database..."
# python scripts/seed_database.py
# -----------------------------------------------------------------------------

# Start the application
echo ""
echo "Step 3: Starting application..."
echo "====================================="
exec uvicorn main:app --host 0.0.0.0 --port $PORT

