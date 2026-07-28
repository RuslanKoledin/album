import { spawn } from 'node:child_process'

import pg from 'pg'

const databaseName = 'photobook_b1_test'
const testDatabaseUrl = new URL(
  process.env.TEST_DATABASE_URL ??
    `postgresql://photobook:photobook_local@localhost:5432/${databaseName}?schema=public`,
)

if (
  !['localhost', '127.0.0.1'].includes(testDatabaseUrl.hostname) ||
  testDatabaseUrl.pathname !== `/${databaseName}`
) {
  throw new Error(
    'Database tests require the explicit local photobook_b1_test database',
  )
}

const adminDatabaseUrl = new URL(testDatabaseUrl)
adminDatabaseUrl.pathname = '/postgres'
adminDatabaseUrl.search = ''
const admin = new pg.Client({ connectionString: adminDatabaseUrl.href })

function run(command, args, environment = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: { ...process.env, ...environment },
      stdio: 'inherit',
    })
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} exited with code ${code ?? 'unknown'}`))
    })
  })
}

async function recreateDatabase() {
  await admin.query(
    `SELECT pg_terminate_backend(pid)
     FROM pg_stat_activity
     WHERE datname = $1 AND pid <> pg_backend_pid()`,
    [databaseName],
  )
  await admin.query(`DROP DATABASE IF EXISTS "${databaseName}"`)
  await admin.query(`CREATE DATABASE "${databaseName}"`)
}

async function dropDatabase() {
  await admin.query(
    `SELECT pg_terminate_backend(pid)
     FROM pg_stat_activity
     WHERE datname = $1 AND pid <> pg_backend_pid()`,
    [databaseName],
  )
  await admin.query(`DROP DATABASE IF EXISTS "${databaseName}"`)
}

await admin.connect()

try {
  await recreateDatabase()
  await run(
    'pnpm',
    [
      'exec',
      'prisma',
      'migrate',
      'deploy',
      '--config',
      'packages/database/prisma.config.ts',
    ],
    { DATABASE_URL: testDatabaseUrl.href },
  )
  await run('pnpm', ['tsx', 'scripts/seed-reference-data.ts'], {
    DATABASE_URL: testDatabaseUrl.href,
  })
  await run(
    'pnpm',
    [
      'vitest',
      'run',
      'packages/database/src/projectRevisionRepository.integration.test.ts',
      'apps/api/src/app.integration.test.ts',
    ],
    {
      DATABASE_URL: testDatabaseUrl.href,
      RUN_DATABASE_TESTS: 'true',
      RUN_HTTP_TESTS: 'true',
      STORAGE_UPLOAD_URL_TTL_SECONDS: '1',
    },
  )
} finally {
  await dropDatabase()
  await admin.end()
}
