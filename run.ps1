# NeuroEase - Run Script
Write-Host "Starting NeuroEase..." -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host ".env.local not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host ".env.local created!" -ForegroundColor Green
    Write-Host ""
}

Write-Host "Starting Expo development server..." -ForegroundColor Green
Write-Host ""
Write-Host "Once started, press:" -ForegroundColor Cyan
Write-Host "  w - Open in web browser" -ForegroundColor White
Write-Host "  a - Open Android emulator" -ForegroundColor White
Write-Host "  i - Open iOS simulator" -ForegroundColor White
Write-Host ""

npm start
