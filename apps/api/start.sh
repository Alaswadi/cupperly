#!/bin/sh
# Don't exit on error for seeding
set +e

echo "🚀 Starting Cupperly API..."

# Run database migrations (exit on error for migrations)
echo "📊 Running database migrations..."
cd /app
npx prisma migrate deploy
if [ $? -ne 0 ]; then
  echo "❌ Migration failed!"
  exit 1
fi

# Seed database (don't exit on error)
echo "🌱 Seeding database..."
cd /app/prisma
npx tsx seed.ts
if [ $? -eq 0 ]; then
  echo "✅ Seeding completed successfully"
else
  echo "⚠️  Seeding skipped or failed (this is OK if data already exists)"
fi

# Start the application (exit on error)
echo "🚀 Starting application..."
cd /app
exec node dist/index.js

