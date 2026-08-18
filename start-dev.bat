@echo off
setlocal
cd /d "%~dp0"

set "NODE_HOME=C:\Users\LENOVO\.workbuddy\binaries\node\versions\22.22.2"
if exist "%NODE_HOME%\node.exe" set "PATH=%NODE_HOME%;%PATH%"

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js not found. Please install Node.js 18+ first.
  pause
  exit /b 1
)

if not exist "node_modules\vite" (
  echo [1/2] Installing dependencies, please wait ...
  call npm install --registry=https://registry.npmmirror.com
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
)

echo.
echo ============================================
echo   Landscape Inspiration Library  -  DEV
echo   URL:  http://127.0.0.1:5180
echo   Press Ctrl+C to stop.
echo ============================================
echo.
call npm run dev
pause
