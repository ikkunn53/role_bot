@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Discord Role Bot

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js was not found. Run setup.bat after installing Node.js 18 or newer.
  goto :failed
)

if not exist ".env" if not exist "config.json" (
  echo [ERROR] Bot configuration was not found. Run setup.bat first.
  goto :failed
)

if not exist "node_modules\discord.js\package.json" (
  echo [ERROR] Required libraries were not found. Run setup.bat first.
  goto :failed
)

echo Starting Discord Role Bot...
echo Keep this window open while using the bot. Press Ctrl+C to stop.
echo.
call npm start
if errorlevel 1 goto :failed
exit /b 0

:failed
echo.
echo The bot stopped because of an error.
pause
exit /b 1
