#!/bin/sh
set -e

echo "🚀 Starting Cupperly API..."

# Run database migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy

# Seed database (will skip if already seeded)
echo "🌱 Seeding database..."
npx prisma db seed || echo "⚠️  Seeding skipped (already done or failed)"

# Start the application
echo "🚀 Starting application..."
exec node dist/index.js

