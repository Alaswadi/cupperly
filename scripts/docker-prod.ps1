# PowerShell script to build and run Cupperly in production mode with Docker
# Usage: .\scripts\docker-prod.ps1 [command]
# Commands: build, up, down, restart, logs, clean

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host "Cupperly Production Docker Manager" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\scripts\docker-prod.ps1 [command]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Green
    Write-Host "  build    - Build production Docker images"
    Write-Host "  up       - Start all services in production mode"
    Write-Host "  down     - Stop all services"
    Write-Host "  restart  - Restart all services"
    Write-Host "  logs     - View logs from all services"
    Write-Host "  clean    - Stop services and remove volumes (WARNING: deletes data)"
    Write-Host "  status   - Show status of all containers"
    Write-Host "  help     - Show this help message"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Magenta
    Write-Host "  .\scripts\docker-prod.ps1 build"
    Write-Host "  .\scripts\docker-prod.ps1 up"
    Write-Host "  .\scripts\docker-prod.ps1 logs"
    Write-Host ""
}

function Build-Images {
    Write-Host "Building production Docker images..." -ForegroundColor Cyan
    docker-compose --env-file .env.production build --no-cache
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Build completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "✗ Build failed!" -ForegroundColor Red
        exit 1
    }
}

function Start-Services {
    Write-Host "Starting services in production mode..." -ForegroundColor Cyan
    docker-compose --env-file .env.production up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Services started successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Services are running at:" -ForegroundColor Yellow
        Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
        Write-Host "  API:      http://localhost:3001" -ForegroundColor White
        Write-Host "  Database: localhost:15432" -ForegroundColor White
        Write-Host "  Redis:    localhost:6379" -ForegroundColor White
        Write-Host ""
        Write-Host "Run 'docker-compose logs -f' to view logs" -ForegroundColor Gray
    } else {
        Write-Host "✗ Failed to start services!" -ForegroundColor Red
        exit 1
    }
}

function Stop-Services {
    Write-Host "Stopping services..." -ForegroundColor Cyan
    docker-compose --env-file .env.production down
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Services stopped successfully!" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to stop services!" -ForegroundColor Red
        exit 1
    }
}

function Restart-Services {
    Write-Host "Restarting services..." -ForegroundColor Cyan
    Stop-Services
    Start-Services
}

function Show-Logs {
    Write-Host "Showing logs (Ctrl+C to exit)..." -ForegroundColor Cyan
    docker-compose --env-file .env.production logs -f
}

function Clean-All {
    Write-Host "WARNING: This will stop all services and delete all data!" -ForegroundColor Red
    $confirmation = Read-Host "Are you sure? (yes/no)"
    if ($confirmation -eq "yes") {
        Write-Host "Cleaning up..." -ForegroundColor Cyan
        docker-compose --env-file .env.production down -v
        Write-Host "✓ Cleanup completed!" -ForegroundColor Green
    } else {
        Write-Host "Cleanup cancelled." -ForegroundColor Yellow
    }
}

function Show-Status {
    Write-Host "Container Status:" -ForegroundColor Cyan
    docker-compose --env-file .env.production ps
}

# Main script logic
switch ($Command.ToLower()) {
    "build" {
        Build-Images
    }
    "up" {
        Start-Services
    }
    "down" {
        Stop-Services
    }
    "restart" {
        Restart-Services
    }
    "logs" {
        Show-Logs
    }
    "clean" {
        Clean-All
    }
    "status" {
        Show-Status
    }
    "help" {
        Show-Help
    }
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Write-Host ""
        Show-Help
        exit 1
    }
}

