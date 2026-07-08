param(
  [switch]$Background
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$publicDir = Join-Path $projectRoot "public"
$logDir = Join-Path $projectRoot ".local"
$logFile = Join-Path $logDir "server.out.log"
$errorLogFile = Join-Path $logDir "server.err.log"
$pidFile = Join-Path $logDir "server.pid"
$port = 5173
$url = "http://localhost:$port/"
$bundledPython = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Test-LocalServer {
  try {
    $response = Invoke-WebRequest -UseBasicParsing $url -TimeoutSec 2
    return $response.StatusCode -eq 200
  } catch {
    return $false
  }
}

function Resolve-Python {
  $candidates = @($bundledPython, "python", "py")
  foreach ($candidate in $candidates) {
    try {
      & $candidate --version *> $null
      if ($LASTEXITCODE -eq 0) {
        return $candidate
      }
    } catch {
      continue
    }
  }
  return $null
}

if (Test-LocalServer) {
  Write-Host "Local server is already running at $url"
  exit 0
}

$python = Resolve-Python
if (-not $python) {
  Write-Error "Python was not found. Install Python or use the bundled Codex runtime."
  exit 1
}

Write-Host "Starting local server at $url"
Write-Host "Serving: $publicDir"

if ($Background) {
  $arguments = "-m http.server $port -d `"$publicDir`""
  $process = Start-Process -FilePath $python -ArgumentList $arguments -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput $logFile -RedirectStandardError $errorLogFile
  Set-Content -Path $pidFile -Value $process.Id
  Start-Sleep -Milliseconds 900
  if (Test-LocalServer) {
    Write-Host "Local server started in background. PID: $($process.Id)"
    exit 0
  }
  Write-Error "Server process started but did not respond. Check $logFile and $errorLogFile"
  exit 1
}

& $python -m http.server $port -d $publicDir
