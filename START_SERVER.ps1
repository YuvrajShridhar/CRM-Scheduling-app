#!/usr/bin/env powershell
# PFS Team Schedule - Local Test Server

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "PFS Team Schedule - Local Test Server" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Starting HTTP server on port 8000..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Once started, open your browser to:" -ForegroundColor Green
Write-Host "  http://localhost:8000/PFSN%20MANAGEMENT%20SYSTEM.html" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C in this window to stop the server" -ForegroundColor Yellow
Write-Host ""

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $cmd = "python"
        Write-Host "Found: $pythonVersion`n" -ForegroundColor Green
    } else {
        throw "python command failed"
    }
} catch {
    try {
        $pythonVersion = python3 --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $cmd = "python3"
            Write-Host "Found: $pythonVersion`n" -ForegroundColor Green
        } else {
            throw "python3 command failed"
        }
    } catch {
        Write-Host "ERROR: Python not found. Please install Python." -ForegroundColor Red
        exit 1
    }
}

# Start the server
& $cmd -m http.server 8000
