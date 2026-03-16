@echo off
title MerkleGuard Launcher
echo =========================================
echo  MerkleGuard - Windows Launcher
echo =========================================
echo.

:: ── Backend ─────────────────────────────────────────────────────────────────
echo [1/2] Starting MerkleGuard Backend...
cd /d "%~dp0backend"

:: Activate venv if it exists (Windows path uses Scripts, not bin)
if exist "venv\Scripts\activate.bat" (
    echo   Found venv - activating...
    start "MerkleGuard Backend" cmd /k "venv\Scripts\activate.bat && python main.py"
) else (
    echo   No venv found - running with system Python...
    start "MerkleGuard Backend" cmd /k "python main.py"
)

:: Give the backend a moment to start before launching the frontend
timeout /t 3 /nobreak >nul

:: ── Frontend ─────────────────────────────────────────────────────────────────
echo [2/2] Starting MerkleGuard Frontend...
cd /d "%~dp0frontend"

:: Install node_modules if they don't exist
if not exist "node_modules" (
    echo   node_modules not found - running npm install...
    npm install
)

start "MerkleGuard Frontend" cmd /k "npm run dev"

:: ── Done ─────────────────────────────────────────────────────────────────────
echo.
echo =========================================
echo  MerkleGuard is starting!
echo  Frontend: http://localhost:5288
echo  Backend:  http://localhost:8288
echo  Close the two terminal windows to stop.
echo =========================================
echo.
pause
