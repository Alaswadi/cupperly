# PowerShell script for faster Docker development builds
# This script uses BuildKit cache mounts for even faster npm installs

Write-Host "🚀 Starting Cupping Lab development environment..." -ForegroundColor Green

# Enable BuildKit for better caching
$env:DOCKER_BUILDKIT = "1"
$env:COMPOSE_DOCKER_CLI_BUILD = "1"

# Check if containers are already running
$runningContainers = docker-compose ps --services --filter "status=running"

if ($runningContainers) {
    Write-Host "📦 Some containers are already running. Stopping them first..." -ForegroundColor Yellow
    docker-compose down
}

# Build and start containers
Write-Host "🔨 Building and starting containers..." -ForegroundColor Blue
docker-compose up -d --build

# Check if all containers started successfully
$allContainers = docker-compose ps --services
$runningContainers = docker-compose ps --services --filter "status=running"

if ($allContainers.Count -eq $runningContainers.Count) {
    Write-Host "✅ All containers started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
    Write-Host "   Frontend: http://localhost:3002" -ForegroundColor White
    Write-Host "   API: http://localhost:3001" -ForegroundColor White
    Write-Host "   Database Admin: http://localhost:8080" -ForegroundColor White
    Write-Host "   PostgreSQL: localhost:15432" -ForegroundColor White
    Write-Host "   Redis: localhost:6379" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 Container status:" -ForegroundColor Cyan
    docker-compose ps
} else {
    Write-Host "❌ Some containers failed to start. Check logs:" -ForegroundColor Red
    docker-compose logs
}
