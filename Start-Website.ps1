param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$projectDirectory = $PSScriptRoot
$websiteUrl = 'http://127.0.0.1:4321'
try {
  $running = $false
  $websiteResponse = $null
  try { $websiteResponse = Invoke-WebRequest -UseBasicParsing -Uri $websiteUrl -TimeoutSec 2 } catch {}
  if ($websiteResponse) {
    if ($websiteResponse.Content -match 'PI Design Group') { $running = $true }
    else { throw 'Another website is using port 4321.' }
  }
  if (-not $running) {
    $nodeExecutable = (Get-Command node.exe -ErrorAction Stop).Source
    $logDirectory = Join-Path $projectDirectory '.logs'
    New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null
    Start-Process -FilePath $nodeExecutable -ArgumentList @('node_modules/astro/bin/astro.mjs','dev','--host','127.0.0.1','--port','4321') -WorkingDirectory $projectDirectory -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logDirectory 'server.log') -RedirectStandardError (Join-Path $logDirectory 'server-error.log') | Out-Null
    $ready = $false
    for ($attempt = 0; $attempt -lt 20; $attempt++) {
      Start-Sleep -Milliseconds 300
      try { $response = Invoke-WebRequest -UseBasicParsing -Uri $websiteUrl -TimeoutSec 1; if ($response.Content -match 'PI Design Group') { $ready = $true; break } } catch {}
    }
    if (-not $ready) { throw 'The website could not start. Open this project in Codex and ask to restart the local website.' }
  }
  if (-not $NoBrowser) { Start-Process $websiteUrl }
} catch {
  if ($NoBrowser) { throw }
  Add-Type -AssemblyName PresentationFramework
  [System.Windows.MessageBox]::Show($_.Exception.Message, 'PI Design Group') | Out-Null
  exit 1
}
