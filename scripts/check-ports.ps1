# Port Conflict Checker for Cupperly Deployment (PowerShell)
# This script checks if required ports are available before deployment

Write-Host "🔍 Checking port availability for Cupperly deployment..." -ForegroundColor Cyan
Write-Host ""

# Ports to check
$ports = @{
    3000 = "Web (Production)"
    3001 = "API"
    3003 = "Web (Dev)"
    5432 = "PostgreSQL (Local)"
    6379 = "Redis"
    8081 = "Adminer (Dev)"
    15432 = "PostgreSQL (Docker)"
}

# Function to check if port is in use
function Test-Port {
    param (
        [int]$Port,
        [string]$Name
    )
    
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    
    if ($connection) {
        Write-Host "✗ Port $Port ($Name) is " -NoNewline
        Write-Host "IN USE" -ForegroundColor Red
        $connection | Select-Object LocalAddress, LocalPort, State, OwningProcess | Format-Table
        return $false
    } else {
        Write-Host "✓ Port $Port ($Name) is " -NoNewline
        Write-Host "available" -ForegroundColor Green
        return $true
    }
}

# Check all ports
$allClear = $true
foreach ($port in $ports.GetEnumerator() | Sort-Object Name) {
    if (-not (Test-Port -Port $port.Key -Name $port.Value)) {
        $allClear = $false
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

if ($allClear) {
    Write-Host "✓ All ports are available!" -ForegroundColor Green
    Write-Host "You can proceed with deployment."
} else {
    Write-Host "✗ Some ports are in use!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Solutions:" -ForegroundColor Yellow
    Write-Host "1. Stop the services using these ports"
    Write-Host "2. For Coolify deployments, use docker-compose.prod.yml (no port conflicts)"
    Write-Host "3. Modify port mappings in docker-compose.yml if needed"
    Write-Host ""
    Write-Host "Common conflicts:" -ForegroundColor Yellow
    Write-Host "  - Port 8080: Usually Coolify itself (Fixed: Adminer now uses 8081)"
    Write-Host "  - Port 3000: Another web server"
    Write-Host "  - Port 5432: Local PostgreSQL installation"
    Write-Host ""
    Write-Host "To find what's using a port:" -ForegroundColor Cyan
    Write-Host "  Get-Process -Id (Get-NetTCPConnection -LocalPort <PORT>).OwningProcess"
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

