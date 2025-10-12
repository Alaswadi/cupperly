# Start Docker Compose with the correct environment file
# This ensures Docker containers use 'postgres' and 'redis' service names
# and NODE_ENV=development for localhost CORS

Write-Host "🐳 Starting Cupperly with Docker Compose..." -ForegroundColor Cyan
Write-Host "📝 Using .env.docker for environment variables" -ForegroundColor Yellow
Write-Host "🔧 NODE_ENV=development (allows localhost CORS)" -ForegroundColor Green
Write-Host ""
Write-Host "⏳ Building and starting containers..." -ForegroundColor Gray
Write-Host ""

# Use .env.docker file
docker-compose --env-file .env.docker up --build

# Note: Press Ctrl+C to stop all services

