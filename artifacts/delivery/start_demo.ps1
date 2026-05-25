$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$pidFile = Join-Path $PSScriptRoot ".demo-pids.json"
$started = @()

function Test-HttpReady {
    param(
        [string]$Url,
        [int]$TimeoutSeconds = 45
    )
    for ($i = 0; $i -lt $TimeoutSeconds; $i++) {
        try {
            Invoke-WebRequest $Url -UseBasicParsing -TimeoutSec 2 | Out-Null
            return $true
        } catch {
            Start-Sleep -Seconds 1
        }
    }
    return $false
}

function Test-PortOpen {
    param([int]$Port)
    return [bool](Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue)
}

function Start-DemoProcess {
    param(
        [string]$Name,
        [int]$Port,
        [string]$ReadyUrl,
        [string]$WorkingDirectory,
        [string[]]$Arguments
    )

    if (Test-PortOpen $Port) {
        Write-Host "$Name already appears to be running on port $Port"
        return
    }

    $process = Start-Process -FilePath "python" `
        -ArgumentList $Arguments `
        -WorkingDirectory $WorkingDirectory `
        -WindowStyle Hidden `
        -PassThru

    if (-not (Test-HttpReady -Url $ReadyUrl)) {
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        throw "$Name did not become ready on port $Port"
    }

    $script:started += [pscustomobject]@{
        name = $Name
        port = $Port
        pid = $process.Id
    }
    Write-Host "$Name ready on $ReadyUrl"
}

Start-DemoProcess `
    -Name "backend" `
    -Port 8000 `
    -ReadyUrl "http://127.0.0.1:8000/health" `
    -WorkingDirectory (Join-Path $root "backend") `
    -Arguments @("-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000")

Start-DemoProcess `
    -Name "admin web" `
    -Port 5173 `
    -ReadyUrl "http://127.0.0.1:5173" `
    -WorkingDirectory $root `
    -Arguments @("-m", "http.server", "5173", "-d", "frontend/admin_web/dist")

Start-DemoProcess `
    -Name "mobile web" `
    -Port 62880 `
    -ReadyUrl "http://127.0.0.1:62880" `
    -WorkingDirectory $root `
    -Arguments @("-m", "http.server", "62880", "-d", "mobile/build/web")

$started | ConvertTo-Json | Set-Content -Encoding UTF8 $pidFile

Write-Host ""
Write-Host "IgniteNow demo is ready:"
Write-Host "Backend:   http://127.0.0.1:8000/health"
Write-Host "Admin Web: http://127.0.0.1:5173"
Write-Host "Player:    http://127.0.0.1:62880"
Write-Host ""
Write-Host "Stop with: powershell -ExecutionPolicy Bypass -File artifacts/delivery/stop_demo.ps1"
