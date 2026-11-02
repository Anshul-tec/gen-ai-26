@echo off
title AI Interview Practice Assistant Launcher
cd /d "%~dp0"

echo ========================================================
echo Launching AI Interview Practice Assistant
echo Group 11 - College Generative AI Project
echo ========================================================
echo.
echo Starting Backend (FastAPI on http://127.0.0.1:8000)...
start "Backend - FastAPI" cmd /k "run_backend.bat"

timeout /t 2 /nobreak >nul

echo Starting Frontend (React on http://127.0.0.1:5173)...
start "Frontend - Vite" cmd /k "run_frontend.bat"

echo.
echo Both servers are starting up!
echo Visit: http://127.0.0.1:5173 in your browser
echo.
pause
