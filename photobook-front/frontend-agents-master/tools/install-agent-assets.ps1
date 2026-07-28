param(
  [Parameter(Mandatory = $true)]
  [string]$TargetProject,

  [string]$SourceProject = ''
)

$ErrorActionPreference = 'Stop'

function Resolve-Directory {
  param(
    [string]$Path,
    [switch]$Create
  )

  if ($Create -and -not (Test-Path -LiteralPath $Path -PathType Container)) {
    New-Item -ItemType Directory -Path $Path | Out-Null
  }

  return (Resolve-Path -LiteralPath $Path).Path
}

function Copy-DirectoryContents {
  param(
    [string]$Source,
    [string]$Destination,
    [switch]$NoOverwriteFiles
  )

  if (-not (Test-Path -LiteralPath $Source -PathType Container)) {
    throw "Missing source directory: $Source"
  }

  if (-not (Test-Path -LiteralPath $Destination -PathType Container)) {
    New-Item -ItemType Directory -Path $Destination | Out-Null
  }

  Get-ChildItem -LiteralPath $Source -Force | ForEach-Object {
    $targetPath = Join-Path $Destination $_.Name
    if ($_.PSIsContainer) {
      Copy-DirectoryContents -Source $_.FullName -Destination $targetPath -NoOverwriteFiles:$NoOverwriteFiles
      return
    }

    if ($NoOverwriteFiles -and (Test-Path -LiteralPath $targetPath -PathType Leaf)) {
      return
    }

    Copy-Item -LiteralPath $_.FullName -Destination $targetPath -Force
  }
}

function Upsert-ManagedBlock {
  param(
    [string]$FilePath,
    [string]$BlockId,
    [string]$BlockContent
  )

  $begin = "<!-- BEGIN $BlockId -->"
  $end = "<!-- END $BlockId -->"
  $block = $begin + [Environment]::NewLine + $BlockContent.Trim() + [Environment]::NewLine + $end

  if (Test-Path -LiteralPath $FilePath -PathType Leaf) {
    $content = Get-Content -LiteralPath $FilePath -Raw
    $pattern = [regex]::Escape($begin) + '(?s).*?' + [regex]::Escape($end)
    if ([regex]::IsMatch($content, $pattern)) {
      $updated = [regex]::Replace($content, $pattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $block })
    } else {
      $updated = $content.TrimEnd() + [Environment]::NewLine + [Environment]::NewLine + $block + [Environment]::NewLine
    }
  } else {
    $updated = "# Codex Project Rules" + [Environment]::NewLine + [Environment]::NewLine + $block + [Environment]::NewLine
  }

  Set-Content -LiteralPath $FilePath -Value $updated -NoNewline
}

if ([string]::IsNullOrWhiteSpace($SourceProject)) {
  $SourceProject = Join-Path $PSScriptRoot '..'
}

$sourceRoot = Resolve-Directory -Path $SourceProject
$targetRoot = Resolve-Directory -Path $TargetProject -Create

$sourceAgentAssets = Join-Path $sourceRoot 'agent-assets'
$targetAgentAssets = Join-Path $targetRoot 'agent-assets'
$sourceFrontendDocs = Join-Path $sourceRoot 'docs\frontend'
$targetFrontendDocs = Join-Path $targetRoot 'docs\frontend'

if (-not (Test-Path -LiteralPath $sourceAgentAssets -PathType Container)) {
  throw "Source project is missing agent-assets: $sourceAgentAssets"
}

Copy-DirectoryContents -Source $sourceAgentAssets -Destination $targetAgentAssets
Copy-DirectoryContents -Source $sourceFrontendDocs -Destination $targetFrontendDocs -NoOverwriteFiles

$localWikiScript = Join-Path $targetRoot 'agent-assets\project-documentation-wiki\scripts\init_project_wiki.py'
if (Test-Path -LiteralPath $localWikiScript -PathType Leaf) {
  python $localWikiScript --project $targetRoot
  if ($LASTEXITCODE -ne 0) {
    throw "Project wiki initialization failed for $targetRoot"
  }
} else {
  throw "Missing project-local wiki init script: $localWikiScript"
}

$agentsBlock = @'
## Project-Local Agent Assets

This project uses local agent assets from `agent-assets/`. Prefer these local skill files and bundled references before global or external instructions when working in this repository.

### Frontend Project Startup

For every frontend project task:

1. Read the project `README.md`, `package.json`, product plan, and the closest `AGENTS.md`.
2. Read `agent-assets/frontend/skills/frontend-agent/SKILL.md` as the authoritative frontend skill and load only the reference relevant to the task.
3. Use `agent-assets/frontend/skills/frontend-error-ux/SKILL.md` for failure, offline, upload, autosave, render, checkout, or payment recovery work.
4. Use the React patterns and TypeScript React Router sub-skills for focused component or routing work.
5. For UI work, use `agent-assets/frontend/skills/photobook-design-review/SKILL.md`; it combines the project design extension with composition, constructor quality gates, accessibility, and browser visual QA.

### Fixed Project Stack

- React 19, TypeScript, Vite, and React Router Framework Mode.
- Redux Toolkit and RTK Query with `fetchBaseQuery`.
- Tailwind CSS, Vitest, and Testing Library.
- No Next.js, Axios, TanStack Router, TanStack Query, Zustand, Ant Design, Zod, i18next, or Sentry without an explicit project decision.

### Testing

Use test-first development for book-domain behavior, commands, reducers, undo/redo, calculations, serialization, API mappings, and bug fixes. Use proportional component tests and browser verification for UI work. Do not require E2E coverage for every visual change.

### Documentation And UI Memory

- Update durable documentation for architecture, APIs, the book schema, reusable UI tokens/components, major screens, and significant user flows.
- Do not create `FEATURE.md` or decision records for trivial leaf components and routine styling fixes.

### Bundled Skills And Agents

- `agent-assets/project-documentation-wiki/SKILL.md`
- `agent-assets/frontend/skills/frontend-agent/SKILL.md`
- `agent-assets/frontend/skills/frontend-error-ux/SKILL.md`
- `agent-assets/frontend/skills/photobook-design-review/SKILL.md`
- `agent-assets/frontend-design-plugin/skills/frontend-design/SKILL.md`
- `agent-assets/react-19-frontend-agent/skills/react-19-frontend-agent/SKILL.md`
- `agent-assets/react-19-frontend-agent/skills/react-19-patterns/SKILL.md`
- `agent-assets/react-19-frontend-agent/skills/typescript-react-routing/SKILL.md`
'@

Upsert-ManagedBlock -FilePath (Join-Path $targetRoot 'AGENTS.md') -BlockId 'PROJECT-LOCAL-AGENT-ASSETS' -BlockContent $agentsBlock

$skillCount = (Get-ChildItem -LiteralPath $targetAgentAssets -Recurse -Filter 'SKILL.md').Count
$agentCount = (Get-ChildItem -LiteralPath $targetAgentAssets -Recurse -Filter 'openai.yaml').Count

Write-Host "Installed project-local agent assets."
Write-Host "Target: $targetRoot"
Write-Host "Skills: $skillCount"
Write-Host "Agents: $agentCount"
