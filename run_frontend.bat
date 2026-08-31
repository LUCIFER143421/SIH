@echo off
cd frontend
echo ============================================================
echo   Starting CRIMENET AI Frontend (Vite + React)
echo ============================================================
echo.

if not exist "node_modules\" (
    echo [INFO] node_modules not found. Running npm install...
    call npm install
)

echo Starting Vite Dev Server on http://localhost:3000...
echo.
call npm run dev

if %errorlevel% neq 0 (
    echo [ERROR] Vite server stopped or failed to start.
    pause
)
