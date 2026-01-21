#!/usr/bin/env powershell
# PFSN Management System - Background Server Launcher
# This runs silently in the background when users open the HTML file

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 8000

# Function to find an available port if 8000 is busy
function Find-AvailablePort($startPort = 8000, $maxAttempts = 10) {
    for ($i = 0; $i -lt $maxAttempts; $i++) {
        $port = $startPort + $i
        try {
            $listener = New-Object System.Net.Sockets.TcpListener("127.0.0.1", $port)
            $listener.Start()
            $listener.Stop()
            return $port
        } catch {
            continue
        }
    }
    return $null
}

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Python not found" }
} catch {
    # Python not available - this is handled by the HTML fallback
    exit 0
}

# Find available port
$port = Find-AvailablePort
if ($null -eq $port) {
    exit 1
}

# Change to script directory
Set-Location $scriptPath

# Determine Python command
if (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} else {
    exit 1
}

# Start Python server silently in background
$pythonProcess = Start-Process $pythonCmd `
    -ArgumentList "-m http.server $port" `
    -NoNewWindow `
    -PassThru `
    -ErrorAction SilentlyContinue

# Keep the script running
if ($pythonProcess) {
    # Wait indefinitely - server will keep running
    $pythonProcess.WaitForExit()
}
