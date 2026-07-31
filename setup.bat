@echo off
setlocal EnableExtensions DisableDelayedExpansion
cd /d "%~dp0"
title Discord Role Bot - Setup

echo ========================================
echo Discord Role Bot - First-time setup
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js was not found.
  echo Install Node.js 18 or newer from https://nodejs.org/ and run this file again.
  goto :failed
)

for /f "tokens=1 delims=.v" %%V in ('node --version') do set "NODE_MAJOR=%%V"
if %NODE_MAJOR% LSS 18 (
  echo [ERROR] Node.js 18 or newer is required. Current version:
  node --version
  goto :failed
)

if exist ".env" (
  echo Existing .env found. It will be kept.
) else (
  echo Copy the following values from Discord Developer Portal.
  echo The bot token is hidden while typing only when using a dedicated secret tool;
  echo this simple setup input will be visible, so do not share this screen.
  echo.
  set /p "DISCORD_TOKEN=Bot Token: "
  set /p "DISCORD_CLIENT_ID=Application ID: "
  set /p "DISCORD_GUILD_ID=Server ID (recommended, Enter to skip): "

  if not defined DISCORD_TOKEN (
    echo [ERROR] Bot Token is required.
    goto :failed
  )
  if not defined DISCORD_CLIENT_ID (
    echo [ERROR] Application ID is required.
    goto :failed
  )

  >".env" (
    echo DISCORD_TOKEN=%DISCORD_TOKEN%
    echo DISCORD_CLIENT_ID=%DISCORD_CLIENT_ID%
    echo DISCORD_GUILD_ID=%DISCORD_GUILD_ID%
  )
  echo .env was created.
)

echo.
echo Installing required libraries...
call npm install
if errorlevel 1 goto :failed

echo.
echo Registering Discord slash commands...
call npm run setup
if errorlevel 1 goto :failed

echo.
echo ========================================
echo Setup completed successfully.
echo Double-click start.bat to run the bot.
echo ========================================
pause
exit /b 0

:failed
echo.
echo Setup failed. Check the message above.
pause
exit /b 1
