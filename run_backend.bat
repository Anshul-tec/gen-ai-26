@echo off
title AI Interview Practice Assistant - Backend Server (FastAPI)
cd /d "%~dp0backend"

echo ========================================================
echo Starting AI Interview Practice Assistant Backend...
echo FastAPI Server on http://127.0.0.1:8000
echo ========================================================

if exist venv\Scripts\python.exe (
    venv\Scripts\uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
) else (
    echo [ERROR] Virtual environment not found. Please run:
    echo cd backend ^&^& python -m venv venv ^&^& .\venv\Scripts\pip install -r requirements.txt
    pause
)
