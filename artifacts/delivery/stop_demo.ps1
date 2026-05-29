$ErrorActionPreference = "Stop"

$pidFile = Join-Path $PSScriptRoot ".demo-pids.json"
if (-not (Test-Path $pidFile)) {
    Write-Host "No demo pid file found."
    exit 0
}

$items = Get-Content -Raw $pidFile | ConvertFrom-Json
foreach ($item in @($items)) {
    $process = Get-Process -Id $item.pid -ErrorAction SilentlyContinue
    if ($process) {
        Stop-Process -Id $item.pid -Force -ErrorAction SilentlyContinue
        Write-Host "Stopped $($item.name) pid=$($item.pid)"
    }
}

Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
Write-Host "Demo stopped."
