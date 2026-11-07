@echo off
title StudyPal
cd /d "%~dp0.."
set MODEL=llama3.1:8b

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js not found. Install it from https://nodejs.org and run this again.
  pause
  exit /b 1
)
where ollama >nul 2>nul
if errorlevel 1 (
  echo Ollama not found. Install it from https://ollama.com and run this again.
  pause
  exit /b 1
)

if not exist node_modules\youtube-transcript (
  echo Installing dependencies...
  call npm install youtube-transcript
)

curl -s http://localhost:11434/api/tags >nul 2>nul
if errorlevel 1 (
  echo Starting Ollama...
  start "Ollama" /min ollama serve
  timeout /t 5 /nobreak >nul
)

ollama list | findstr /i /c:"%MODEL%" >nul
if errorlevel 1 (
  echo Downloading %MODEL% - first run only...
  ollama pull %MODEL%
)

echo Starting StudyPal at http://localhost:3000
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"
node local\server.js
pause
