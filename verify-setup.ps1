# System Verification Script
# Run this to verify your setup is correct

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Study Group - System Verification" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Node.js
Write-Host "Checking Node.js..." -NoNewline
try {
    $nodeVersion = node --version
    Write-Host " ✓ $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host " ✗ Not installed" -ForegroundColor Red
    $allGood = $false
}

# Check Python
Write-Host "Checking Python..." -NoNewline
try {
    $pythonVersion = python --version
    Write-Host " ✓ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host " ✗ Not installed" -ForegroundColor Red
    $allGood = $false
}

# Check Frontend .env.local
Write-Host "Checking Frontend .env.local..." -NoNewline
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL=https://" -and 
        $envContent -match "NEXT_PUBLIC_SUPABASE_ANON_KEY=ey") {
        Write-Host " ✓ Configured" -ForegroundColor Green
    } else {
        Write-Host " ✗ Missing keys" -ForegroundColor Yellow
        $allGood = $false
    }
} else {
    Write-Host " ✗ Not found" -ForegroundColor Red
    $allGood = $false
}

# Check AI Service .env
Write-Host "Checking AI Service .env..." -NoNewline
if (Test-Path "..\studygroup-ai-service\.env") {
    $aiEnvContent = Get-Content "..\studygroup-ai-service\.env" -Raw
    if ($aiEnvContent -match "SUPABASE_URL=https://" -and 
        $aiEnvContent -match "SUPABASE_SERVICE_KEY=ey" -and
        $aiEnvContent -match "GOOGLE_API_KEY=AIza") {
        Write-Host " ✓ Configured" -ForegroundColor Green
    } else {
        Write-Host " ✗ Missing keys" -ForegroundColor Yellow
        $allGood = $false
    }
} else {
    Write-Host " ✗ Not found" -ForegroundColor Red
    $allGood = $false
}

# Check node_modules
Write-Host "Checking Frontend dependencies..." -NoNewline
if (Test-Path "node_modules") {
    Write-Host " ✓ Installed" -ForegroundColor Green
} else {
    Write-Host " ✗ Run: npm install" -ForegroundColor Yellow
    $allGood = $false
}

# Check AI Service venv
Write-Host "Checking AI Service venv..." -NoNewline
if (Test-Path "..\studygroup-ai-service\venv") {
    Write-Host " ✓ Created" -ForegroundColor Green
} else {
    Write-Host " ✗ Run: python -m venv venv" -ForegroundColor Yellow
    $allGood = $false
}

# Check if Frontend is running
Write-Host "Checking Frontend (port 3000)..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -Method Head -TimeoutSec 2 -ErrorAction Stop
    Write-Host " ✓ Running" -ForegroundColor Green
} catch {
    Write-Host " ✗ Not running" -ForegroundColor Yellow
}

# Check if AI Service is running
Write-Host "Checking AI Service (port 8000)..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    $health = $response.Content | ConvertFrom-Json
    if ($health.status -eq "healthy") {
        Write-Host " ✓ Running & Healthy" -ForegroundColor Green
    } else {
        Write-Host " ⚠ Running but unhealthy" -ForegroundColor Yellow
    }
} catch {
    Write-Host " ✗ Not running" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "✓ All checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Start Frontend: npm run dev" -ForegroundColor White
    Write-Host "2. Start AI Service: cd ..\studygroup-ai-service; .\venv\Scripts\Activate.ps1; python main.py" -ForegroundColor White
} else {
    Write-Host "⚠ Some issues found. Please fix them before proceeding." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Cyan
    Write-Host "- Install dependencies: npm install" -ForegroundColor White
    Write-Host "- Create .env files: Copy from .env.example" -ForegroundColor White
    Write-Host "- Create venv: cd ..\studygroup-ai-service; python -m venv venv" -ForegroundColor White
    Write-Host "- Install Python packages: .\venv\Scripts\Activate.ps1; pip install -r requirements.txt" -ForegroundColor White
}

Write-Host "================================" -ForegroundColor Cyan
