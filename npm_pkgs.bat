@echo off
where node >nul 2>&1
if errorlevel 1 echo Please install node. Exiting... && exit /b 1
where npm >nul 2>&1
if errorlevel 1 echo Please install npm. Exiting... && exit /b 1
echo Installing all dependencies in package.json...
npm install