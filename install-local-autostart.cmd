@echo off
setlocal
cd /d "%~dp0"
set "TASK_NAME=IntelektWebApp Local Server"
set "SCRIPT=%~dp0start-local.ps1"
schtasks /Create /F /SC ONLOGON /TN "%TASK_NAME%" /TR "powershell -NoProfile -ExecutionPolicy Bypass -File ""%SCRIPT%"" -Background"
echo.
echo Autostart task installed: %TASK_NAME%
echo The local server will start after Windows login.
pause
