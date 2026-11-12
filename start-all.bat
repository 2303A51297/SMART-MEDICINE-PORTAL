@echo off
echo ===================================================================
echo Starting Smart Medicine Ordering and Pharmacy Management Portal
echo ===================================================================

echo [1/2] Starting Backend API Server (Port 5000)...
start "MediPharm Backend" cmd /k "cd backend && node server.js"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Web Portal (Port 5173)...
start "MediPharm Frontend" cmd /k "cd frontend && npm.cmd run dev"

timeout /t 2 /nobreak >nul

echo ===================================================================
echo Applications Started Successfully!
echo Frontend URL: http://localhost:5173
echo Backend API:  http://localhost:5000/api/health
echo ===================================================================
pause

