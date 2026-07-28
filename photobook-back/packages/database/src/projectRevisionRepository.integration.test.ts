import { randomUUID } from 'node:crypto'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { loadAppConfig } from '@photobook/config'
import { createJsonHash } from '@photobook/domain'

import type { Prisma } from './generated/prisma/client.js'
import { createPrismaClient } from './createPrismaClient.js'
import { ProjectRevisionRepository } from './projectRevisionRepository.js'

const runDatabaseTests = process.env.RUN_DATABASE_TESTS === 'true'
const databaseUrl = loadAppConfig().database.url
const client = createPrismaClient(databaseUrl)
const repository = new ProjectRevisionRepository(client)
const suffix = randomUUID()
const ownerId = `user-${suffix}`
const catalogVersionId = `catalog-${suffix}`
const projectId = `project-${suffix}`
const initialRevisionId = `revision-initial-${suffix}`
const initialDocument: Prisma.InputJsonValue = {
  schemaVersion: 1,
  title: 'Initial',
}

describe.runIf(runDatabaseTests)('ProjectRevisionRepository', () => {
  beforeAll(async () => {
    await client.user.create({
      data: {
        id: ownerId,
        phone: `+996${suffix.replaceAll('-', '').slice(0, 9)}`,
      },
    })
    const catalog: Prisma.InputJsonValue = {
      catalogVersion: catalogVersionId,
    }
    await client.catalogVersion.create({
      data: {
        contentHash: createJsonHash(catalog),
        id: catalogVersionId,
        payload: catalog,
        publishedAt: new Date(),
      },
    })
  })

  afterAll(async () => {
    await client.$disconnect()
  })

  it('preserves immutable revisions and resolves retry conflicts', async () => {
    const initial = await repository.createWithInitialRevision({
      catalogVersionId,
      categoryTags: ['family'],
      document: initialDocument,
      ownerId,
      productId: 'mock-product',
      projectId,
      revisionId: initialRevisionId,
      templateId: 'mock-template',
      title: 'Test book',
    })
    expect(initial.project.latestRevisionId).toBe(initialRevisionId)
    expect(initial.revision.revisionNumber).toBe(1)

    const nextDocument: Prisma.InputJsonValue = {
      schemaVersion: 1,
      title: 'Saved',
    }
    const created = await repository.saveRevision({
      baseRevisionId: initialRevisionId,
      clientMutationId: `mutation-${suffix}`,
      document: nextDocument,
      ownerId,
      projectId,
      revisionId: `revision-next-${suffix}`,
    })
    expect(created.kind).toBe('created')
    if (created.kind !== 'created') return

    const replayed = await repository.saveRevision({
      baseRevisionId: initialRevisionId,
      clientMutationId: `mutation-${suffix}`,
      document: nextDocument,
      ownerId,
      projectId,
      revisionId: `revision-retry-${suffix}`,
    })
    expect(replayed).toMatchObject({
      kind: 'replayed',
      revision: { id: created.revision.id },
    })

    const mutationConflict = await repository.saveRevision({
      baseRevisionId: initialRevisionId,
      clientMutationId: `mutation-${suffix}`,
      document: { schemaVersion: 1, title: 'Different payload' },
      ownerId,
      projectId,
      revisionId: `revision-conflict-${suffix}`,
    })
    expect(mutationConflict).toEqual({ kind: 'mutation_conflict' })

    const staleBase = await repository.saveRevision({
      baseRevisionId: initialRevisionId,
      clientMutationId: `stale-mutation-${suffix}`,
      document: nextDocument,
      ownerId,
      projectId,
      revisionId: `stale-revision-${suffix}`,
    })
    expect(staleBase).toEqual({
      kind: 'revision_conflict',
      latestRevisionId: created.revision.id,
    })

    const hiddenFromAnotherOwner = await repository.saveRevision({
      baseRevisionId: created.revision.id,
      clientMutationId: `foreign-mutation-${suffix}`,
      document: nextDocument,
      ownerId: `another-user-${suffix}`,
      projectId,
      revisionId: `foreign-revision-${suffix}`,
    })
    expect(hiddenFromAnotherOwner).toEqual({ kind: 'project_not_found' })

    const revisions = await client.projectRevision.findMany({
      orderBy: { revisionNumber: 'asc' },
      where: { projectId },
    })
    expect(revisions).toHaveLength(2)
    expect(revisions[0]).toMatchObject({
      document: initialDocument,
      id: initialRevisionId,
      revisionNumber: 1,
    })
    expect(revisions[1]).toMatchObject({
      baseRevisionId: initialRevisionId,
      id: created.revision.id,
      revisionNumber: 2,
    })
  })
})
