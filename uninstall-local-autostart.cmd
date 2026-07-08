@echo off
setlocal
set "TASK_NAME=IntelektWebApp Local Server"
schtasks /Delete /F /TN "%TASK_NAME%"
echo.
echo Autostart task removed: %TASK_NAME%
pause
