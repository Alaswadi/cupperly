# Test if the API is running and responding correctly

Write-Host "🧪 Testing Cupperly API..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1️⃣  Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -Method GET -UseBasicParsing
    Write-Host "   ✅ Health check passed!" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Health check failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "   💡 Make sure the API is running:" -ForegroundColor Yellow
    Write-Host "      cd apps/api" -ForegroundColor Gray
    Write-Host "      npm run dev" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# Test 2: CORS Preflight
Write-Host "2️⃣  Testing CORS Preflight (OPTIONS)..." -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = "http://localhost:3000"
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "Content-Type"
    }
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" -Method OPTIONS -Headers $headers -UseBasicParsing
    
    $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
    if ($corsHeader) {
        Write-Host "   ✅ CORS headers present!" -ForegroundColor Green
        Write-Host "   Access-Control-Allow-Origin: $corsHeader" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ CORS headers missing!" -ForegroundColor Red
    }
} catch {
    Write-Host "   ⚠️  OPTIONS request failed (this might be normal)" -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# Test 3: Actual Login Request
Write-Host "3️⃣  Testing Login Endpoint..." -ForegroundColor Yellow
try {
    $body = @{
        email = "admin@demo.com"
        password = "demo123"
    } | ConvertTo-Json

    $headers = @{
        "Content-Type" = "application/json"
        "X-Tenant-ID" = "demo"
        "Origin" = "http://localhost:3000"
    }

    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $body -Headers $headers -UseBasicParsing
    
    Write-Host "   ✅ Login endpoint responding!" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    
    $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
    if ($corsHeader) {
        Write-Host "   ✅ CORS header in response: $corsHeader" -ForegroundColor Green
    } else {
        Write-Host "   ❌ No CORS header in response!" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Login request failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   Status Code: $statusCode" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "📊 Test Summary:" -ForegroundColor Cyan
Write-Host "   If all tests passed, your API is configured correctly!" -ForegroundColor Green
Write-Host "   If CORS tests failed, check the API logs for errors." -ForegroundColor Yellow
Write-Host ""

