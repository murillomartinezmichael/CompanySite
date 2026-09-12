@echo off
REM Clean-clone setup for the actual Astro site. Never publishes.
setlocal
pushd "%~dp0" || exit /b 1
where npm >nul 2>&1 || goto :missing_npm
call npm ci
if not "%errorlevel%"=="0" goto :failed
call npm run build
if not "%errorlevel%"=="0" goto :failed
call npm test
if not "%errorlevel%"=="0" goto :failed
echo [build] READY: build fence and tests passed. Preview with npm run preview.
popd
exit /b 0
:missing_npm
echo [fail] Install Node and npm first.
popd
exit /b 1
:failed
set "build_exit=%errorlevel%"
popd
exit /b %build_exit%
