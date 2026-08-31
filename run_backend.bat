@echo off
cd backend
echo ============================================================
echo   Starting CRIMENET AI Backend (FastAPI + Uvicorn)
echo ============================================================
echo.
python main.py

if %errorlevel% neq 0 (
    echo [ERROR] Backend stopped or failed to start.
    pause
)
