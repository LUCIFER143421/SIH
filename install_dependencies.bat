@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo   CRIMENET AI - Dependency Installer ^& Environment Setup
echo   (SIH 2026 Problem Statement 26189)
echo ============================================================
echo.

:: 1. Check Python
echo [1/3] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python was not found in PATH!
    echo Please install Python 3.10+ from https://www.python.org/
    pause
    exit /b 1
)
python --version

:: 2. Install Backend Python Requirements
echo.
echo [2/3] Installing Backend Python packages (FastAPI, NetworkX, RapidFuzz, etc.)...
python -m pip install --upgrade pip
python -m pip install fastapi uvicorn pydantic networkx python-louvain rapidfuzz httpx python-multipart jinja2 pytest

if %errorlevel% neq 0 (
    echo [WARNING] Some packages encountered an issue during pip install. Trying with --user flag...
    python -m pip install --user fastapi uvicorn pydantic networkx python-louvain rapidfuzz httpx python-multipart jinja2 pytest
)

:: 3. Check and Install Node.js / Frontend Requirements
echo.
echo [3/3] Installing Frontend NPM packages (React, Tailwind, Cytoscape.js, etc.)...
cd frontend
call npm install
cd ..

echo.
echo ============================================================
echo   SUCCESS! All dependencies installed successfully.
echo ============================================================
echo.
echo You can now double-click start.bat to launch the entire system.
echo.
pause
