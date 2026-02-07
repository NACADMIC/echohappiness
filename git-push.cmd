@echo off
cd /d "%~dp0"

where git >nul 2>nul
if errorlevel 1 (
    echo Git not found.
    pause
    exit /b 1
)

echo Git Push...
git add .
git status
echo.
set /p msg="Commit message: "
if "%msg%"=="" set msg=update
git commit -m "%msg%"
git push
echo.
echo Done.
pause
