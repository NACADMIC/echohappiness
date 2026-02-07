@echo off
cd /d "%~dp0"
set "REPO=%~dp0"
set "REPO=%REPO:~0,-1%"

set "GIT_EXE="
where git >nul 2>nul && set "GIT_EXE=git"
if not defined GIT_EXE (
    if exist "C:\Program Files\Git\cmd\git.exe" set "PATH=%PATH%;C:\Program Files\Git\cmd" && set "GIT_EXE=git"
)
if not defined GIT_EXE (
    if exist "C:\Program Files\Git\bin\git.exe" set "PATH=%PATH%;C:\Program Files\Git\bin" && set "GIT_EXE=git"
)
if not defined GIT_EXE (
    if exist "%LOCALAPPDATA%\Programs\Git\cmd\git.exe" set "PATH=%PATH%;%LOCALAPPDATA%\Programs\Git\cmd" && set "GIT_EXE=git"
)
if not defined GIT_EXE (
    echo Git not found.
    pause
    exit /b 1
)

if not exist "%REPO%\.git" (
    echo Initializing git in donation folder...
    git -C "%REPO%" init
)

if exist "%REPO%\.git\index.lock" (
    echo Removing stale lock file...
    del "%REPO%\.git\index.lock"
)

echo Git Push - donation folder only...
git -C "%REPO%" add .
git -C "%REPO%" status
echo.
set /p msg="Commit message: "
if "%msg%"=="" set msg=update
git -C "%REPO%" commit -m "%msg%"
git -C "%REPO%" push
echo.
echo Done.
pause
