# Reset Admin Password
# This resets the admin@demo.com password back to demo123

Write-Host "🔑 Resetting Admin Password..." -ForegroundColor Cyan
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

Write-Host "🔄 Resetting password for admin@demo.com..." -ForegroundColor Yellow
Write-Host ""

# Run the reset script from packages/database directory
cd packages/database
node ../../reset-password.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host "🌐 Try logging in at: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "=============================================" -ForegroundColor Cyan
} else {
    Write-Host "❌ Password reset failed!" -ForegroundColor Red
}

cd ../..

Write-Host ""

