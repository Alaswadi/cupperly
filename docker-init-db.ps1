# Initialize Database for Docker
# Run this ONCE after starting docker-compose for the first time

Write-Host "🗄️  Initializing Cupperly Database..." -ForegroundColor Cyan
Write-Host ""

# Check if API container is running
$apiRunning = docker ps --filter "name=cupperly-api" --filter "status=running" --format "{{.Names}}"

if ($apiRunning -ne "cupperly-api") {
    Write-Host "❌ API container is not running!" -ForegroundColor Red
    Write-Host "   Please start docker-compose first:" -ForegroundColor Yellow
    Write-Host "   docker-compose up -d" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ API container is running" -ForegroundColor Green
Write-Host ""

# Run migrations
Write-Host "1️⃣  Running database migrations..." -ForegroundColor Yellow
docker-compose exec -T api npx prisma migrate deploy --schema=./prisma/schema.prisma

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Migrations completed!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Migrations failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Seed database
Write-Host "2️⃣  Seeding database with demo data..." -ForegroundColor Yellow
docker-compose exec -T api sh -c "cd prisma && npx prisma db seed"

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Database seeded!" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Seeding may have failed or data already exists" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "✅ Database initialization complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Demo credentials:" -ForegroundColor Yellow
Write-Host "   Email: admin@demo.com" -ForegroundColor Gray
Write-Host "   Password: demo123" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Open: http://localhost:3000" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

