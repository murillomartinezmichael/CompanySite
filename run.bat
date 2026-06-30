@echo off
REM Serve CompanySite locally on port 8081.
setlocal
cd /d "%~dp0"

where python >nul 2>nul || (echo [ERROR] Python needed to serve static files. ^& pause ^& exit /b 1)

echo.
echo Serving CompanySite at http://localhost:8081
echo Press Ctrl+C to stop.
echo.

start "" cmd /c "timeout /t 2 >nul & start http://localhost:8081"
python -m http.server 8081

endlocal
