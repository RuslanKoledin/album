import { loadAppConfig } from '@photobook/config'
import {
  ContractValidator,
  readContractArtifactJson,
} from '@photobook/contracts'
import { createPrismaClient } from '@photobook/database'
import type { Prisma } from '@photobook/database'
import { createJsonHash } from '@photobook/domain'

const CATALOG_PATH = 'fixtures/catalog/v1/valid/mock-book-config-bundle.json'

async function main() {
  const config = loadAppConfig()
  const client = createPrismaClient(config.database.url)
  const validator = new ContractValidator()

  try {
    const payload = readContractArtifactJson(CATALOG_PATH)
    const validation = validator.validateHttp('catalogVersionResponse', payload)
    if (!validation.ok) {
      throw new Error('Reference catalog does not match the frozen contract')
    }
    const catalog = payload as {
      readonly catalogVersion: string
    }
    const contentHash = createJsonHash(payload)
    const existing = await client.catalogVersion.findUnique({
      where: { id: catalog.catalogVersion },
    })
    if (existing && existing.contentHash !== contentHash) {
      throw new Error('Published catalog version is immutable')
    }
    if (!existing) {
      await client.catalogVersion.create({
        data: {
          contentHash,
          id: catalog.catalogVersion,
          payload: payload as Prisma.InputJsonValue,
          publishedAt: new Date(),
        },
      })
    }
  } finally {
    await client.$disconnect()
  }
}

await main()
