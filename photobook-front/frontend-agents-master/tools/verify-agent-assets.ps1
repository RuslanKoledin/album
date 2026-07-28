param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'

function Assert-PathExists {
  param(
    [string]$RelativePath,
    [string]$Kind = 'Any'
  )

  $fullPath = Join-Path $ProjectRoot $RelativePath
  if ($Kind -eq 'Directory') {
    if (-not (Test-Path -LiteralPath $fullPath -PathType Container)) {
      throw "Missing directory: $RelativePath"
    }
    return
  }

  if ($Kind -eq 'File') {
    if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
      throw "Missing file: $RelativePath"
    }
    return
  }

  if (-not (Test-Path -LiteralPath $fullPath)) {
    throw "Missing path: $RelativePath"
  }
}

function Assert-OldRootFolderMoved {
  param([string]$RelativePath)

  $fullPath = Join-Path $ProjectRoot $RelativePath
  if (Test-Path -LiteralPath $fullPath) {
    throw "Expected old root folder to be moved: $RelativePath"
  }
}

function Read-JsonFile {
  param([string]$RelativePath)

  $fullPath = Join-Path $ProjectRoot $RelativePath
  try {
    return Get-Content -LiteralPath $fullPath -Raw | ConvertFrom-Json
  } catch {
    throw "Invalid JSON in $RelativePath`: $($_.Exception.Message)"
  }
}

$requiredPaths = @(
  @{ Path = 'agent-assets'; Kind = 'Directory' },
  @{ Path = 'agent-assets\README.md'; Kind = 'File' },
  @{ Path = 'agent-assets\FEATURE.md'; Kind = 'File' },
  @{ Path = 'agent-assets\frontend\.codex-plugin\plugin.json'; Kind = 'File' },
  @{ Path = 'agent-assets\frontend\.claude-plugin\plugin.json'; Kind = 'File' },
  @{ Path = 'agent-assets\frontend\FEATURE.md'; Kind = 'File' },
  @{ Path = 'agent-assets\frontend\skills\frontend-agent\SKILL.md'; Kind = 'File' },
  @{ Path = 'agent-assets\frontend\skills\frontend-agent\agents\openai.yaml'; Kind = 'File' },
  @{ Path = 'agent-assets\frontend\skills\frontend-error-ux\SKILL.md'; Kind = 'File' },
  @{ Path = 'agent-assets\frontend\skills\frontend-error-ux\agents\openai.yaml'; Kind = 'File' },
  @{ Path = 'agent-assets\frontend\skills\photobook-design-review\SKILL.md'; Kind = 'File' },
  @{ Path = 'agent-assets\frontend\skills\photobook-design-review\agents\openai.yaml'; Kind = 'File' },
  @{ Path = 'agent-assets\frontend\skills\frontend-agent\references\frontend-architecture.md'; Kind = 'File' },
  @{ Path = 'agent-assets\frontend-design-plugin\.claude-plugin\plugin.json'; Kind = 'File' },
  @{ Path = 'agent-assets\frontend-design-plugin\README.md'; Kind = 'File' },
  @{ Path = 'agent-assets\frontend-design-plugin\LICENSE'; Kind = 'File' },
  @{ Path = 'agent-assets\frontend-design-plugin\skills\frontend-design\SKILL.md'; Kind = 'File' },
  @{ Path = 'agent-assets\frontend-design-plugin\skills\frontend-design\PROJECT_EXTENSION.md'; Kind = 'File' },
  @{ Path = 'agent-assets\project-documentation-wiki\SKILL.md'; Kind = 'File' },
  @{ Path = 'agent-assets\project-documentation-wiki\agents\openai.yaml'; Kind = 'File' },
  @{ Path = 'agent-assets\project-documentation-wiki\scripts\init_project_wiki.py'; Kind = 'File' },
  @{ Path = 'agent-assets\project-documentation-wiki\references\llm-wiki-pattern.md'; Kind = 'File' },
  @{ Path = 'agent-assets\react-19-frontend-agent\.codex-plugin\plugin.json'; Kind = 'File' },
  @{ Path = 'agent-assets\react-19-frontend-agent\.claude-plugin\plugin.json'; Kind = 'File' },
  @{ Path = 'agent-assets\react-19-frontend-agent\FEATURE.md'; Kind = 'File' },
  @{ Path = 'agent-assets\react-19-frontend-agent\skills\react-19-frontend-agent\SKILL.md'; Kind = 'File' },
  @{ Path = 'agent-assets\react-19-frontend-agent\skills\react-19-frontend-agent\agents\openai.yaml'; Kind = 'File' },
  @{ Path = 'agent-assets\react-19-frontend-agent\skills\react-19-patterns\SKILL.md'; Kind = 'File' },
  @{ Path = 'agent-assets\react-19-frontend-agent\skills\react-19-patterns\agents\openai.yaml'; Kind = 'File' },
  @{ Path = 'agent-assets\react-19-frontend-agent\skills\nextjs-app-router-practices\SKILL.md'; Kind = 'File' },
  @{ Path = 'agent-assets\react-19-frontend-agent\skills\nextjs-app-router-practices\agents\openai.yaml'; Kind = 'File' },
  @{ Path = 'agent-assets\react-19-frontend-agent\skills\typescript-react-routing\SKILL.md'; Kind = 'File' },
  @{ Path = 'agent-assets\react-19-frontend-agent\skills\typescript-react-routing\agents\openai.yaml'; Kind = 'File' }
)

foreach ($entry in $requiredPaths) {
  Assert-PathExists -RelativePath $entry.Path -Kind $entry.Kind
}

foreach ($oldFolder in @('frontend', 'frontend-design-plugin', 'react-19-frontend-agent')) {
  Assert-OldRootFolderMoved -RelativePath $oldFolder
}

$pluginManifests = @(
  'agent-assets\frontend\.codex-plugin\plugin.json',
  'agent-assets\frontend\.claude-plugin\plugin.json',
  'agent-assets\frontend-design-plugin\.claude-plugin\plugin.json',
  'agent-assets\react-19-frontend-agent\.codex-plugin\plugin.json',
  'agent-assets\react-19-frontend-agent\.claude-plugin\plugin.json'
)

foreach ($manifestPath in $pluginManifests) {
  $manifest = Read-JsonFile -RelativePath $manifestPath
  if (-not $manifest.name) {
    throw "Plugin manifest is missing a name: $manifestPath"
  }
}

$skillFiles = Get-ChildItem -LiteralPath (Join-Path $ProjectRoot 'agent-assets') -Recurse -Filter 'SKILL.md'
$agentFiles = Get-ChildItem -LiteralPath (Join-Path $ProjectRoot 'agent-assets') -Recurse -Filter 'openai.yaml'
$referenceFiles = Get-ChildItem -LiteralPath (Join-Path $ProjectRoot 'agent-assets') -Recurse -File |
  Where-Object { $_.FullName -match '\\references\\' -or $_.Name -match '(?i)rule|checklist|governance|extension' }

if ($skillFiles.Count -lt 8) {
  throw "Expected at least 8 skill files, found $($skillFiles.Count)"
}

if ($agentFiles.Count -lt 7) {
  throw "Expected at least 7 agent files, found $($agentFiles.Count)"
}

if ($referenceFiles.Count -lt 20) {
  throw "Expected at least 20 reference/rule files, found $($referenceFiles.Count)"
}

Write-Host "agent-assets verification passed."
Write-Host "Skills: $($skillFiles.Count)"
Write-Host "Agents: $($agentFiles.Count)"
Write-Host "Reference/rule files: $($referenceFiles.Count)"
