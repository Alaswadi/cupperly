# Start Cupperly in Local Development Mode
# This script starts the backend and frontend for local development

Write-Host "🚀 Starting Cupperly - Local Development Mode" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is running
Write-Host "1️⃣  Checking PostgreSQL..." -ForegroundColor Yellow
$postgresRunning = docker ps --filter "name=cupperly-postgres" --filter "status=running" --format "{{.Names}}"

if ($postgresRunning -eq "cupperly-postgres") {
    Write-Host "   ✅ PostgreSQL is running" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  PostgreSQL is not running. Starting it..." -ForegroundColor Yellow
    docker-compose up postgres -d
    Start-Sleep -Seconds 3
    Write-Host "   ✅ PostgreSQL started" -ForegroundColor Green
}

Write-Host ""

# Check environment variables
Write-Host "2️⃣  Checking environment variables..." -ForegroundColor Yellow
$dbUrl = Get-Content .env | Select-String "DATABASE_URL"
if ($dbUrl -match "localhost:5432") {
    Write-Host "   ✅ DATABASE_URL points to localhost (correct for local dev)" -ForegroundColor Green
} elseif ($dbUrl -match "postgres:5432") {
    Write-Host "   ⚠️  DATABASE_URL points to 'postgres' (this is for Docker)" -ForegroundColor Yellow
    Write-Host "   💡 For local dev, it should be 'localhost:5432'" -ForegroundColor Yellow
    Write-Host "   Run: cp .env.local .env" -ForegroundColor Gray
} else {
    Write-Host "   ❌ DATABASE_URL not found in .env" -ForegroundColor Red
}

Write-Host ""

# Instructions
Write-Host "3️⃣  Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Open TWO new terminals and run:" -ForegroundColor White
Write-Host ""
Write-Host "   Terminal 1 (Backend):" -ForegroundColor Cyan
Write-Host "   cd apps/api" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "   Terminal 2 (Frontend):" -ForegroundColor Cyan
Write-Host "   cd apps/web" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "   Then open: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "📚 Need help? Check LOCAL_DEV_SETUP.md" -ForegroundColor Yellow
Write-Host ""

