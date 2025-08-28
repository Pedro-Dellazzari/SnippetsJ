Write-Host "Iniciando Snippets App..." -ForegroundColor Green
Write-Host ""

Write-Host "[1/2] Iniciando React..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev:react"

Write-Host "[2/2] Aguardando React e iniciando Electron..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$maxAttempts = 30
$attempt = 0

do {
    $attempt++
    Write-Host "Tentativa $attempt de $maxAttempts - Verificando se React está pronto..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            Write-Host "React pronto! Iniciando Electron..." -ForegroundColor Green
            npm run dev:electron
            break
        }
    }
    catch {
        Start-Sleep -Seconds 2
    }
} while ($attempt -lt $maxAttempts)

if ($attempt -eq $maxAttempts) {
    Write-Host "Timeout: React não inicializou a tempo." -ForegroundColor Red
}