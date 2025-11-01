# Script to kill any process using port 5173
# Run this before starting your dev server

Write-Host "🔍 Checking for processes using port 5173..." -ForegroundColor Cyan

$processInfo = netstat -ano | findstr :5173

if ($processInfo) {
    Write-Host "✅ Found process using port 5173:" -ForegroundColor Yellow
    Write-Host $processInfo -ForegroundColor Gray
    
    # Extract PID from netstat output
    $pid = ($processInfo -split '\s+')[-1]
    
    if ($pid -match '^\d+$') {
        Write-Host "💀 Killing process with PID: $pid" -ForegroundColor Red
        try {
            taskkill /PID $pid /F
            Write-Host "✅ Successfully killed process $pid" -ForegroundColor Green
            Write-Host "🚀 You can now run: npm run dev" -ForegroundColor Cyan
        } catch {
            Write-Host "❌ Failed to kill process. Try running as Administrator." -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Could not extract PID from netstat output" -ForegroundColor Red
    }
} else {
    Write-Host "✅ Port 5173 is free! You can run: npm run dev" -ForegroundColor Green
}

Write-Host ""
Read-Host "Press Enter to exit"
