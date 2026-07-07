@echo off
REM CompanySite - Astro dev server. Opens http://localhost:4321 by default.
setlocal
cd /d "%~dp0"
where npm >nul 2>nul || (echo [ERROR] npm not on PATH - run setup.bat first^& exit /b 1)
echo Starting Astro dev server on http://localhost:4321
echo Press Ctrl+C to stop.
call npm run dev
endlocal
