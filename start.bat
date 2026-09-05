@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ============================================================
echo   CRIMENET AI - Criminal Network Analysis System
echo   SIH 2026 Problem Statement 26189
echo ============================================================
echo.

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in your PATH.
    echo Please install Python 3.10+ and re-run.
    pause
    exit /b 1
)

:: Check if FastAPI is installed
echo [1/3] Verifying Python backend dependencies...
python -c "import fastapi, uvicorn, networkx, rapidfuzz, pydantic" >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Missing Python dependencies detected. Installing automatically...
    python -m pip install -r backend\requirements.txt
    if %errorlevel% neq 0 (
        python -m pip install --user -r backend\requirements.txt
    )
) else (
    echo [OK] Backend dependencies verified.
)

:: Check Frontend node_modules
echo [2/3] Verifying Frontend NPM dependencies...
if not exist "frontend\node_modules\" (
    echo [INFO] Frontend packages not found. Installing node_modules...
    cd frontend
    call npm install
    cd ..
) else (
    echo [OK] Frontend dependencies verified.
)

:: Launch Backend and Frontend
echo.
echo [3/3] Launching CRIMENET AI Servers...
echo ------------------------------------------------------------
echo  - Backend API:  http://localhost:8000
echo  - API Docs:     http://localhost:8000/docs
echo  - Frontend UI:  http://localhost:3000
echo ------------------------------------------------------------
echo.

start "CRIMENET AI [Backend]" cmd /k "cd backend && python main.py"
timeout /t 3 /nobreak >nul
start "CRIMENET AI [Frontend]" cmd /k "cd frontend && npm run dev"

echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:3000
