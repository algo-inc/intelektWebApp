param()

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $projectRoot ".local\server.pid"
$port = 5173

if (Test-Path $pidFile) {
  $processId = Get-Content -Raw $pidFile
  $processId = [int]($processId.Trim())
  $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
  if ($process) {
    Stop-Process -Id $processId -Force
    Remove-Item $pidFile -Force
    Write-Host "Local server stopped. PID: $processId"
    exit 0
  }
}

$connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($connections) {
  $connections | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
    Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
    Write-Host "Stopped process on port $port. PID: $_"
  }
  exit 0
}

Write-Host "Local server is not running."
