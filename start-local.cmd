@echo off
setlocal
cd /d "%~dp0"
echo Starting IntelektWebApp local server...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-local.ps1"
echo.
echo Server window closed. Press any key to exit.
pause > nul
