@echo off
REM CompanySite - Astro 4 + Tailwind. First-run env prep.
setlocal
cd /d "%~dp0"
where npm >nul 2>nul || (echo [ERROR] npm not on PATH ^(install Node 18+^)^& exit /b 1)
echo [1/1] npm install...
call npm install || exit /b 1
echo Setup complete. Start dev server with: run.bat
endlocal
