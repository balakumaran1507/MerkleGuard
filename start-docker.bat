@echo off
title MerkleGuard Docker Launcher
echo =========================================
echo  MerkleGuard - Docker Launcher
echo =========================================
echo.

:: Check Docker is installed and running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running or not installed!
    echo Please install Docker Desktop and make sure it is running.
    echo Download: https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

echo [OK] Docker is running.
echo.

:: ── Clean old containers ─────────────────────────────────────────────────────
echo Stopping any existing MerkleGuard containers...
docker compose down --remove-orphans 2>nul

:: ── Build & Launch ───────────────────────────────────────────────────────────
echo Building and starting MerkleGuard with Docker Compose...
echo (This may take a few minutes on first run to download images and install dependencies)
echo.
docker compose up --build

:: If docker compose exits, pause so the user can read any error output
pause
