@echo off
setlocal
cd /d "%~dp0"

set "NODE_HOME=C:\Users\LENOVO\.workbuddy\binaries\node\versions\22.22.2"
if exist "%NODE_HOME%\node.exe" set "PATH=%NODE_HOME%;%PATH%"

if not exist "node_modules\vite" (
  echo Installing dependencies ...
  call npm install --registry=https://registry.npmmirror.com
)

echo Building static site into .\dist ...
call npm run build
if errorlevel 1 (
  echo [ERROR] build failed.
  pause
  exit /b 1
)

echo.
echo Build finished. Preview with:  npm run preview
echo Output folder: %cd%\dist
pause
