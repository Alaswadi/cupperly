# Setup Database for Docker - Simple Version
# This runs migrations and seed from your local machine to the Docker database

Write-Host "🗄️  Setting up Cupperly Database..." -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL container is running
$postgresRunning = docker ps --filter "name=cupperly-postgres" --filter "status=running" --format "{{.Names}}"

if ($postgresRunning -ne "cupperly-postgres") {
    Write-Host "❌ PostgreSQL container is not running!" -ForegroundColor Red
    Write-Host "   Please start docker-compose first:" -ForegroundColor Yellow
    Write-Host "   docker-compose up -d postgres" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ PostgreSQL container is running" -ForegroundColor Green
Write-Host ""

# Set DATABASE_URL to point to Docker postgres
$env:DATABASE_URL = "postgresql://postgres:password@localhost:5432/cupperly"

Write-Host "1️⃣  Running database migrations..." -ForegroundColor Yellow
Write-Host "   Using: $env:DATABASE_URL" -ForegroundColor Gray

cd packages/database

# Run migrations
npx prisma migrate deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Migrations completed!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Migrations failed!" -ForegroundColor Red
    cd ../..
    exit 1
}

Write-Host ""

# Seed database
Write-Host "2️⃣  Seeding database with demo data..." -ForegroundColor Yellow
npx prisma db seed

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Database seeded!" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Seeding may have failed or data already exists" -ForegroundColor Yellow
}

cd ../..

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "✅ Database setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Demo credentials:" -ForegroundColor Yellow
Write-Host "   Email: admin@demo.com" -ForegroundColor Gray
Write-Host "   Password: demo123" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Open: http://localhost:3000" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

