@echo off
REM Quick HTTP Server for PFS Team Schedule
REM This script starts a simple local server so the app can load correctly

echo.
echo ========================================
echo PFS Team Schedule - Local Test Server
echo ========================================
echo.
echo Starting local HTTP server on port 8000...
echo.
echo Once started, open your browser to:
echo   http://localhost:8000/Gemini%20Test_2409.html
echo.
echo Press Ctrl+C to stop the server
echo.
timeout /t 2

python -m http.server 8000

pause
