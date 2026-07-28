import { createHash } from 'node:crypto'
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const backendRoot = path.resolve(import.meta.dirname, '..')
const frontendRoot = path.resolve(
  process.env.PHOTOBOOK_FRONTEND_DIR ??
    path.join(backendRoot, '..', 'photobook-front'),
)
const sourceDirectory = path.join(frontendRoot, 'docs', 'api')
const targetDirectory = path.join(
  backendRoot,
  'packages',
  'contracts',
  'artifacts',
)
const manifestSourceDirectory = path
  .relative(backendRoot, sourceDirectory)
  .split(path.sep)
  .join('/')
const contractEntries = ['openapi.yaml', 'schemas', 'fixtures', 'examples']

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name)
      return entry.isDirectory() ? listFiles(entryPath) : [entryPath]
    }),
  )

  return files.flat()
}

async function assertContractSource() {
  const openApi = await readFile(path.join(sourceDirectory, 'openapi.yaml'))
  if (openApi.length === 0) throw new Error('OpenAPI source is empty')
}

async function createSourceDigest() {
  const files = [
    path.join(sourceDirectory, 'openapi.yaml'),
    ...(await listFiles(path.join(sourceDirectory, 'schemas'))),
    ...(await listFiles(path.join(sourceDirectory, 'fixtures'))),
    ...(await listFiles(path.join(sourceDirectory, 'examples'))),
  ].sort()
  const hash = createHash('sha256')

  for (const file of files) {
    const relativePath = path
      .relative(sourceDirectory, file)
      .split(path.sep)
      .join('/')
    hash.update(relativePath)
    hash.update('\0')
    hash.update(await readFile(file))
    hash.update('\0')
  }

  return `sha256:${hash.digest('hex')}`
}

async function syncContracts() {
  await assertContractSource()
  await rm(targetDirectory, { force: true, recursive: true })
  await mkdir(targetDirectory, { recursive: true })

  for (const entry of contractEntries) {
    await cp(
      path.join(sourceDirectory, entry),
      path.join(targetDirectory, entry),
      {
        recursive: true,
      },
    )
  }

  const manifest = {
    copiedAt: new Date().toISOString(),
    sourceDigest: await createSourceDigest(),
    sourceDirectory: manifestSourceDirectory,
  }

  await writeFile(
    path.join(targetDirectory, 'source.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  )

  process.stdout.write(`Contracts synchronized from ${manifest.sourceDigest}\n`)
}

await syncContracts()
