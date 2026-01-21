#!/usr/bin/env powershell
# Quick verification script for PFS Team Schedule app

Write-Host "=== PFS Team Schedule - File Verification ===" -ForegroundColor Cyan
Write-Host ""

$requiredFiles = @(
    "Gemini Test_2409.html",
    "js/app.js",
    "js/config.js",
    "js/ui.js",
    "js/db.js",
    "js/utils.js",
    "js/schedule.js",
    "js/landing.js",
    "js/forecast.js",
    "js/clientinfo.js",
    "js/settings.js",
    "js/dragdrop.js",
    "css/styles.css",
    "DEBUG_HELPER.html"
)

$allOk = $true

foreach ($file in $requiredFiles) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        $size = (Get-Item $fullPath).Length
        Write-Host "✓ $file ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "✗ $file - MISSING" -ForegroundColor Red
        $allOk = $false
    }
}

Write-Host ""
if ($allOk) {
    Write-Host "All required files are present!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Open DEBUG_HELPER.html to check the app with error logging"
    Write-Host "2. Or open Gemini Test_2409.html directly and check Developer Console (F12)"
    Write-Host "3. Watch for the loading spinner to hide when data loads"
} else {
    Write-Host "Some files are missing! Please check the errors above." -ForegroundColor Red
}

Write-Host ""
