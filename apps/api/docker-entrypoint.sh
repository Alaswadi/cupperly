#!/bin/sh
# Docker entrypoint script for Cupperly API
# This script runs database migrations and seeds before starting the API

set -e

echo "🚀 Starting Cupperly API..."
echo "📊 Environment: $NODE_ENV"
echo "🔍 Database: $DATABASE_URL"

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until npx prisma db execute --stdin <<< "SELECT 1" > /dev/null 2>&1; do
  echo "   Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Check if database is empty (no users)
USER_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"User\"" 2>/dev/null | tail -n 1 || echo "0")

if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
  echo "📝 Database is empty, running seed..."
  npx prisma db seed
  echo "✅ Database seeded!"
else
  echo "✅ Database already has data, skipping seed"
fi

# Start the application
echo "🚀 Starting API server..."
exec node dist/index.js

