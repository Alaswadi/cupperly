#!/bin/sh
set -e

echo "🚀 Starting Cupperly API..."

# Run database migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy

# Check if database is seeded (check if any users exist)
echo "🌱 Checking if database needs seeding..."
USER_COUNT=$(npx prisma db execute --stdin <<EOF
SELECT COUNT(*) as count FROM users;
EOF
2>/dev/null | grep -o '[0-9]*' | head -1 || echo "0")

if [ "$USER_COUNT" = "0" ]; then
  echo "🌱 Seeding database..."
  npx prisma db seed || echo "⚠️  Seeding failed or already done"
else
  echo "✅ Database already seeded (found $USER_COUNT users)"
fi

# Start the application
echo "🚀 Starting application..."
exec node dist/index.js

