# Fix Expo Go Android Error Script
Write-Host "🔧 Fixing Expo Go Android Error..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Check .env.local
Write-Host "Step 1: Checking environment variables..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ .env.local not found! Creating from .env.example..." -ForegroundColor Red
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ .env.local created. Please edit it with your Firebase credentials!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit .env.local with your actual Firebase keys before running the app!" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "✅ .env.local exists" -ForegroundColor Green
}

# Step 2: Clear cache
Write-Host ""
Write-Host "Step 2: Clearing Expo cache..." -ForegroundColor Yellow
if (Test-Path ".expo") {
    Remove-Item -Recurse -Force ".expo"
    Write-Host "✅ Expo cache cleared" -ForegroundColor Green
} else {
    Write-Host "✅ No cache to clear" -ForegroundColor Green
}

# Step 3: Clear Metro bundler cache
Write-Host ""
Write-Host "Step 3: Clearing Metro bundler cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "✅ Metro cache cleared" -ForegroundColor Green
} else {
    Write-Host "✅ No Metro cache to clear" -ForegroundColor Green
}

# Step 4: Check node_modules
Write-Host ""
Write-Host "Step 4: Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ node_modules exists" -ForegroundColor Green
}

# Step 5: Run diagnostics
Write-Host ""
Write-Host "Step 5: Running Expo diagnostics..." -ForegroundColor Yellow
npx expo-doctor

Write-Host ""
Write-Host "🎉 Fix complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure .env.local has your Firebase credentials" -ForegroundColor White
Write-Host "2. Run: npm start" -ForegroundColor White
Write-Host "3. Scan QR code with Expo Go app" -ForegroundColor White
Write-Host ""
Write-Host "If still not working, check TROUBLESHOOTING.md" -ForegroundColor Yellow
