import { defineConfig } from 'prisma/config'

const localDatabaseUrl =
  'postgresql://photobook:photobook_local@localhost:5432/photobook?schema=public'

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL ?? localDatabaseUrl,
  },
  migrations: {
    path: 'prisma/migrations',
  },
  schema: 'prisma/schema.prisma',
})
