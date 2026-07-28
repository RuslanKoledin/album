import { readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, dirname, extname, relative, resolve, sep } from 'node:path'

const projectRoot = resolve(import.meta.dirname, '..')
const sourceRoot = resolve(projectRoot, 'src')
const testsRoot = resolve(projectRoot, 'tests')
const violations = []

const walk = (directory) =>
  readdirSync(directory).flatMap((entry) => {
    const path = resolve(directory, entry)

    return statSync(path).isDirectory() ? walk(path) : path
  })

const sourceFiles = walk(sourceRoot).filter((path) =>
  ['.ts', '.tsx'].includes(extname(path)),
)
const testFiles = walk(testsRoot).filter((path) =>
  ['.ts', '.tsx'].includes(extname(path)),
)
const checkedFiles = [...sourceFiles, ...testFiles]

const toProjectPath = (path) => relative(projectRoot, path).split(sep).join('/')
const addViolation = (path, message) =>
  violations.push(`${toProjectPath(path)}: ${message}`)

const importPattern = /(?:from\s*|import\s*\()(['"])([^'"]+)\1/g
const internalAliasOwners = new Map([
  ['@auth/', 'src/modules/auth/'],
  ['@auth-ui/', 'src/modules/auth/ui/'],
  ['@catalog/', 'src/modules/catalog/'],
  ['@create-project/', 'src/modules/create-project/'],
  ['@create-project-ui/', 'src/modules/create-project/ui/'],
  ['@editor/', 'src/modules/editor/'],
  ['@editor-ui/', 'src/modules/editor/ui/'],
  ['@project/', 'src/modules/project/'],
  ['@project-review/', 'src/modules/project-review/'],
  ['@project-review-ui/', 'src/modules/project-review/ui/'],
  ['@order/', 'src/modules/order/'],
  ['@order-ui/', 'src/modules/order/ui/'],
  ['@operator/', 'src/modules/operator/'],
  ['@operator-ui/', 'src/modules/operator/ui/'],
  ['@photo-upload/', 'src/modules/photo-upload/'],
  ['@photo-upload-ui/', 'src/modules/photo-upload/ui/'],
  ['@preflight/', 'src/modules/preflight/'],
  ['@preflight-ui/', 'src/modules/preflight/ui/'],
  ['@pricing/', 'src/modules/pricing/'],
  ['@shared-ui/', 'src/shared/ui/'],
])

for (const path of checkedFiles) {
  const content = readFileSync(path, 'utf8')
  const projectPath = toProjectPath(path)
  const isTest =
    projectPath.startsWith('tests/') || /\.(?:test|spec)\.[jt]sx?$/.test(path)
  const isBarrel = basename(path) === 'index.ts'
  const lines = content.split(/\r?\n/).length

  for (const match of content.matchAll(importPattern)) {
    const importPath = match[2]

    if (importPath.startsWith('../')) {
      addViolation(path, `parent-relative import is forbidden: ${importPath}`)
    }

    if (/^@modules\/[^/]+\//.test(importPath)) {
      addViolation(path, `module deep import is forbidden: ${importPath}`)
    }

    const pageDeepImport = importPath.match(/^@pages\/([^/]+)\//)
    if (
      pageDeepImport &&
      !projectPath.startsWith(`src/pages/${pageDeepImport[1]}/`)
    ) {
      addViolation(path, `page deep import is internal only: ${importPath}`)
    }

    if (
      /^@shared\/[^/]+\//.test(importPath) &&
      !importPath.includes('/fonts/')
    ) {
      addViolation(path, `shared deep import is forbidden: ${importPath}`)
    }

    if (
      importPath.startsWith('@core/book/') &&
      !projectPath.startsWith('src/core/book/')
    ) {
      addViolation(
        path,
        `core deep import is internal to core/book: ${importPath}`,
      )
    }

    if (
      importPath.startsWith('@app/') &&
      !projectPath.startsWith('src/app/') &&
      importPath !== '@app/mocks'
    ) {
      addViolation(path, `app deep import is forbidden: ${importPath}`)
    }

    for (const [alias, owner] of internalAliasOwners) {
      if (importPath.startsWith(alias) && !projectPath.startsWith(owner)) {
        addViolation(path, `internal alias ${alias} belongs to ${owner}`)
      }
    }

    const modulePublicImport = importPath.match(/^@modules\/([^/]+)$/)
    if (
      modulePublicImport &&
      projectPath.startsWith(`src/modules/${modulePublicImport[1]}/`)
    ) {
      addViolation(
        path,
        `module cannot import its own public barrel: ${importPath}`,
      )
    }

    const pagePublicImport = importPath.match(/^@pages\/([^/]+)$/)
    if (
      pagePublicImport &&
      projectPath.startsWith(`src/pages/${pagePublicImport[1]}/`)
    ) {
      addViolation(
        path,
        `page cannot import its own public barrel: ${importPath}`,
      )
    }

    const sharedPublicImport = importPath.match(/^@shared\/([^/]+)$/)
    if (
      sharedPublicImport &&
      projectPath.startsWith(`src/shared/${sharedPublicImport[1]}/`)
    ) {
      addViolation(
        path,
        `shared area cannot import its own public barrel: ${importPath}`,
      )
    }

    if (
      importPath.startsWith('@mocks/') &&
      !isTest &&
      !projectPath.startsWith('src/app/mocks/') &&
      !projectPath.includes('/mocks/')
    ) {
      addViolation(
        path,
        `mock entry points are test/app-mock only: ${importPath}`,
      )
    }
  }

  if (isBarrel) {
    content.split(/\r?\n/).forEach((line, index) => {
      const trimmed = line.trim()

      if (
        trimmed &&
        !trimmed.startsWith('//') &&
        !/^export \* from ['"]\.\/.+['"]$/.test(trimmed)
      ) {
        addViolation(
          path,
          `barrel line ${index + 1} must use export * from './...': ${trimmed}`,
        )
      }

      if (
        !projectPath.includes('/mocks/') &&
        !projectPath.includes('/testing/') &&
        /^export \* from ['"]\.\/(?:mocks|testing)(?:\/|['"])/.test(trimmed)
      ) {
        addViolation(
          path,
          `production barrel cannot expose mock/testing code: ${trimmed}`,
        )
      }
    })
    continue
  }

  let maxLines = 300
  if (isTest) maxLines = 350
  else if (path.endsWith('.tsx'))
    maxLines = projectPath.startsWith('src/pages/') ? 250 : 220
  else if (/\/use[A-Z][^/]*\.ts$/.test(path)) maxLines = 180
  else if (/\/(?:lib|libs)\//.test(path)) maxLines = 200
  else if (/\/api\/[^/]+\.ts$|\/model\/api\.ts$/.test(path)) maxLines = 280

  if (lines > maxLines) {
    addViolation(path, `${lines} lines exceeds the ${maxLines}-line limit`)
  }

  if (path.endsWith('.tsx') && !isTest && projectPath !== 'src/app/root.tsx') {
    const componentDeclarations = [
      ...content.matchAll(/(?:export\s+)?function\s+([A-Z][A-Za-z0-9]*)\s*\(/g),
      ...content.matchAll(
        /(?:export\s+)?const\s+([A-Z][A-Za-z0-9]*)\s*=\s*(?:\([^)]*\)|[^=\n]+)=>/g,
      ),
    ].map((match) => match[1])

    if (new Set(componentDeclarations).size > 1) {
      addViolation(
        path,
        `one component per file; found ${[...new Set(componentDeclarations)].join(', ')}`,
      )
    }
  }

  if (/\/use[A-Z][^/]*\.ts$/.test(path) && !isTest) {
    const hooks = [
      ...content.matchAll(/export\s+const\s+(use[A-Z][A-Za-z0-9]*)\s*=/g),
      ...content.matchAll(/export\s+function\s+(use[A-Z][A-Za-z0-9]*)\s*\(/g),
    ].map((match) => match[1])

    if (new Set(hooks).size > 1) {
      addViolation(
        path,
        `one hook per file; found ${[...new Set(hooks)].join(', ')}`,
      )
    }
  }

  if (/[←↶↷]/u.test(content)) {
    addViolation(path, 'unicode UI icon found; use react-icons')
  }

  if (
    content.includes('<svg') &&
    !projectPath.includes('/iconpack/') &&
    !projectPath.includes('/BookSurfaceRenderer/')
  ) {
    addViolation(
      path,
      'inline SVG is allowed only in iconpack or book renderer',
    )
  }
}

const indexExceptions = new Set([
  'src',
  'src/app',
  'src/app/routes',
  'src/core',
  'src/modules',
  'src/pages',
  'src/shared',
])

const codeDirectories = new Set()
for (const path of sourceFiles) {
  let directory = dirname(path)
  while (directory.startsWith(sourceRoot)) {
    codeDirectories.add(directory)
    if (directory === sourceRoot) break
    directory = dirname(directory)
  }
}
for (const directory of codeDirectories) {
  const projectPath = toProjectPath(directory)
  const files = readdirSync(directory)

  if (!indexExceptions.has(projectPath) && !files.includes('index.ts')) {
    addViolation(directory, 'code folder must expose index.ts')
  }
}

if (violations.length > 0) {
  console.error(
    `Architecture check failed with ${violations.length} violation(s):`,
  )
  violations.forEach((violation) => console.error(`- ${violation}`))
  process.exit(1)
}

console.log(
  `Architecture check passed for ${sourceFiles.length} source and ${testFiles.length} test-support files.`,
)
