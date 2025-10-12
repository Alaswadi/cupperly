#!/bin/sh
set -e

echo "🚀 Starting Cupperly API..."

# Run database migrations
echo "📊 Running database migrations..."
cd /app
npx prisma migrate deploy

# Seed database (will skip if already seeded)
echo "🌱 Seeding database..."
cd /app/prisma
npx tsx seed.ts || echo "⚠️  Seeding skipped (already done or failed)"

# Start the application
echo "🚀 Starting application..."
cd /app
exec node dist/index.js

