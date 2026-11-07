@echo off
title StudyPal (Gemini)
cd /d "%~dp0.."
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js not found. Install it from https://nodejs.org and run this again.
  pause
  exit /b 1
)
if not exist node_modules\youtube-transcript (
  echo Installing dependencies...
  call npm install youtube-transcript
)
echo Starting StudyPal at http://localhost:3000
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"
node local\server.js
pause
