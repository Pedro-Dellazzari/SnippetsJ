@echo off
echo Iniciando Snippets App...
echo.

echo [1/2] Iniciando React...
start "React Dev Server" cmd /k "npm run dev:react"

echo [2/2] Aguardando React e iniciando Electron...
timeout /t 5 /nobreak > nul

:check_react
powershell -Command "try { Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing -TimeoutSec 1 | Out-Null; exit 0 } catch { exit 1 }" > nul 2>&1
if %errorlevel% neq 0 (
    echo Aguardando React inicializar...
    timeout /t 2 /nobreak > nul
    goto check_react
)

echo React pronto! Iniciando Electron...
npm run dev:electron