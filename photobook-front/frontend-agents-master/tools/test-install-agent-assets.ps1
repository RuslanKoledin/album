param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'

function Assert-PathExists {
  param(
    [string]$Root,
    [string]$RelativePath,
    [string]$Kind = 'Any'
  )

  $fullPath = Join-Path $Root $RelativePath
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

function Assert-FileContains {
  param(
    [string]$Root,
    [string]$RelativePath,
    [string]$Expected
  )

  $fullPath = Join-Path $Root $RelativePath
  $content = Get-Content -LiteralPath $fullPath -Raw
  if (-not $content.Contains($Expected)) {
    throw "Expected $RelativePath to contain: $Expected"
  }
}

$target = Join-Path ([System.IO.Path]::GetTempPath()) ("agent-assets-install-test-" + [System.Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $target | Out-Null

try {
  $installer = Join-Path $ProjectRoot 'tools\install-agent-assets.ps1'
  & powershell -NoProfile -ExecutionPolicy Bypass -File $installer -TargetProject $target -SourceProject $ProjectRoot

  Assert-PathExists -Root $target -RelativePath 'agent-assets' -Kind 'Directory'
  Assert-PathExists -Root $target -RelativePath 'agent-assets\frontend\skills\frontend-agent\SKILL.md' -Kind 'File'
  Assert-PathExists -Root $target -RelativePath 'agent-assets\frontend\skills\frontend-agent\agents\openai.yaml' -Kind 'File'
  Assert-PathExists -Root $target -RelativePath 'agent-assets\frontend\skills\frontend-error-ux\SKILL.md' -Kind 'File'
  Assert-PathExists -Root $target -RelativePath 'agent-assets\frontend\skills\frontend-error-ux\agents\openai.yaml' -Kind 'File'
  Assert-PathExists -Root $target -RelativePath 'agent-assets\frontend\skills\photobook-design-review\SKILL.md' -Kind 'File'
  Assert-PathExists -Root $target -RelativePath 'agent-assets\frontend\skills\photobook-design-review\agents\openai.yaml' -Kind 'File'
  Assert-PathExists -Root $target -RelativePath 'agent-assets\frontend-design-plugin\skills\frontend-design\PROJECT_EXTENSION.md' -Kind 'File'
  Assert-PathExists -Root $target -RelativePath 'agent-assets\react-19-frontend-agent\skills\react-19-frontend-agent\SKILL.md' -Kind 'File'
  Assert-PathExists -Root $target -RelativePath 'agent-assets\project-documentation-wiki\SKILL.md' -Kind 'File'
  Assert-PathExists -Root $target -RelativePath 'agent-assets\project-documentation-wiki\agents\openai.yaml' -Kind 'File'
  Assert-PathExists -Root $target -RelativePath 'AGENTS.md' -Kind 'File'
  Assert-PathExists -Root $target -RelativePath 'docs\wiki\index.md' -Kind 'File'
  Assert-PathExists -Root $target -RelativePath 'docs\wiki\schema.md' -Kind 'File'
  Assert-PathExists -Root $target -RelativePath 'docs\wiki\log.md' -Kind 'File'
  Assert-PathExists -Root $target -RelativePath 'docs\frontend\README.md' -Kind 'File'
  Assert-PathExists -Root $target -RelativePath 'docs\frontend\audit-checklist.md' -Kind 'File'

  Assert-FileContains -Root $target -RelativePath 'AGENTS.md' -Expected 'agent-assets/frontend/skills/frontend-agent/SKILL.md'
  Assert-FileContains -Root $target -RelativePath 'AGENTS.md' -Expected 'agent-assets/project-documentation-wiki/SKILL.md'
  Assert-FileContains -Root $target -RelativePath 'AGENTS.md' -Expected 'Frontend Project Startup'
  Assert-FileContains -Root $target -RelativePath 'AGENTS.md' -Expected 'agent-assets/frontend/skills/frontend-error-ux/SKILL.md'
  Assert-FileContains -Root $target -RelativePath 'AGENTS.md' -Expected 'agent-assets/frontend/skills/photobook-design-review/SKILL.md'
  Assert-FileContains -Root $target -RelativePath 'AGENTS.md' -Expected 'Redux Toolkit and RTK Query'
  Assert-FileContains -Root $target -RelativePath 'AGENTS.md' -Expected 'Use test-first development for book-domain behavior'

  $skillCount = (Get-ChildItem -LiteralPath (Join-Path $target 'agent-assets') -Recurse -Filter 'SKILL.md').Count
  $agentCount = (Get-ChildItem -LiteralPath (Join-Path $target 'agent-assets') -Recurse -Filter 'openai.yaml').Count

  if ($skillCount -lt 8) {
    throw "Expected at least 8 project-local skills, found $skillCount"
  }

  if ($agentCount -lt 7) {
    throw "Expected at least 7 project-local agent files, found $agentCount"
  }

  Write-Host "install-agent-assets test passed."
  Write-Host "Target: $target"
  Write-Host "Skills: $skillCount"
  Write-Host "Agents: $agentCount"
} finally {
  if (Test-Path -LiteralPath $target) {
    Remove-Item -LiteralPath $target -Recurse -Force
  }
}
