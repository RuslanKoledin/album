param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'

$templateRoot = Join-Path $ProjectRoot 'Template Project'
$agentsFile = Join-Path $templateRoot 'AGENTS.md'
$readmeFile = Join-Path $templateRoot 'README.md'
$featureFile = Join-Path $templateRoot 'FEATURE.md'

foreach ($path in @($templateRoot, $agentsFile, $readmeFile, $featureFile)) {
  if (-not (Test-Path -LiteralPath $path)) {
    throw "Missing archived template path: $path"
  }
}

$agents = Get-Content -LiteralPath $agentsFile -Raw
$readme = Get-Content -LiteralPath $readmeFile -Raw
$feature = Get-Content -LiteralPath $featureFile -Raw

if (-not $agents.Contains('Archived Template Rules')) {
  throw 'Template AGENTS.md must prevent activation of the stale skill copy.'
}

if (-not $readme.Contains('Do not copy or activate it')) {
  throw 'Template README.md must mark the snapshot as non-installable.'
}

if (-not $feature.Contains('Archived. Do not use for project bootstrap.')) {
  throw 'Template FEATURE.md must record archived status.'
}

Write-Host 'Archived Template Project verification passed.'
Write-Host "Template: $templateRoot"
