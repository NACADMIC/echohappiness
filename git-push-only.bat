@echo off
cd /d "%~dp0"

where git >nul 2>nul || (
    if exist "C:\Program Files\Git\cmd\git.exe" set "PATH=%PATH%;C:\Program Files\Git\cmd"
)

echo Add + Commit + Push...
git add .
git commit -m "update"
git push
echo.
echo Done.
pause
