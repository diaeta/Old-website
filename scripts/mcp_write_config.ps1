$ErrorActionPreference = 'Stop'

# Determine project root from this script location
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

# Paths to node bin wrappers
$binDir = Join-Path $projectRoot 'mcp-servers\node_modules\.bin'

# Escape backslashes for TOML string values
function Escape-Backslashes([string]$p) { return ($p -replace '\\','\\\\') }

$projEsc   = Escape-Backslashes $projectRoot
$binPlay   = Escape-Backslashes (Join-Path $binDir 'mcp-server-playwright.cmd')
$binPptr   = Escape-Backslashes (Join-Path $binDir 'puppeteer-mcp-server.cmd')
$binFs     = Escape-Backslashes (Join-Path $binDir 'mcp-server-filesystem.cmd')
$binGit    = Escape-Backslashes (Join-Path $binDir 'git-mcp-server.cmd')
$binGh     = Escape-Backslashes (Join-Path $binDir 'mcp-server-github.cmd')
$binA11y   = Escape-Backslashes (Join-Path $binDir 'a11y-mcp.cmd')
$binMem    = Escape-Backslashes (Join-Path $binDir 'memory-bank-mcp.cmd')
$binFetch  = Escape-Backslashes (Join-Path $binDir 'mcp-fetch-server.cmd')
$outDir    = Escape-Backslashes (Join-Path $projectRoot '.playwright-mcp')

# Build trust key with extended path prefix
$trustKey  = "'\\\\?\\$projEsc'"

$cfg = @"
[projects.$trustKey]
trust_level = "trusted"

[mcp.servers]

  [mcp.servers.playwright]
  command = "$binPlay"
  args = ["--headless", "--output-dir", "$outDir"]

  [mcp.servers.puppeteer]
  command = "$binPptr"
  args = []

  [mcp.servers.filesystem]
  command = "$binFs"
  args = [
    "$projEsc"
  ]

  [mcp.servers.git]
  command = "$binGit"
  args = []

  [mcp.servers.github]
  command = "$binGh"
  args = []
  env = { GITHUB_TOKEN = "${GITHUB_TOKEN}" }

  [mcp.servers.a11y]
  command = "$binA11y"
  args = []

  [mcp.servers.memory_bank]
  command = "$binMem"
  args = ["--path", "$projEsc", "--folder", "memory-bank"]

  [mcp.servers.fetch]
  command = "$binFetch"
  args = []
"@

$codexDir = Join-Path $env:USERPROFILE '.codex'
New-Item -ItemType Directory -Force -Path $codexDir | Out-Null
$cfgPath = Join-Path $codexDir 'config.toml'
if (Test-Path $cfgPath) { Copy-Item -Path $cfgPath -Destination (Join-Path $codexDir 'config.backup.toml') -Force }
Set-Content -Path $cfgPath -Value $cfg -Encoding UTF8 -Force
Write-Host "Wrote Codex config:" $cfgPath
