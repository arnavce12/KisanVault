# KisanVault Backend - Startup Script
# Run from the backend directory

$env:PYTHONPATH = "."

Write-Host "Starting KisanVault Backend..." -ForegroundColor Green
Write-Host "API Docs: http://127.0.0.1:8000/docs" -ForegroundColor Cyan

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
