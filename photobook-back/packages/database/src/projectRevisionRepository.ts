import {
  createDocumentHash,
  createRevisionRequestHash,
} from '@photobook/domain'

import { Prisma } from './generated/prisma/client.js'
import type { PhotobookPrismaClient } from './createPrismaClient.js'
import type {
  CreateProjectWithRevisionInput,
  PhotobookTransactionClient,
  ProjectWithRevision,
  SaveProjectRevisionInput,
  SaveProjectRevisionResult,
} from './projectRevisionRepository.types.js'

class ConcurrentRevisionWriteError extends Error {}

function isPrismaWriteConflict(error: unknown) {
  if (error instanceof ConcurrentRevisionWriteError) return true
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return false
  }

  return error.code === 'P2002' || error.code === 'P2034'
}

export class ProjectRevisionRepository {
  constructor(private readonly client: PhotobookPrismaClient) {}

  async createWithInitialRevision(
    input: CreateProjectWithRevisionInput,
    transaction?: PhotobookTransactionClient,
  ): Promise<ProjectWithRevision> {
    const documentHash = createDocumentHash(input.document)
    const create = async (database: PhotobookTransactionClient) => {
      await database.project.create({
        data: {
          catalogVersionId: input.catalogVersionId,
          categoryTags: [...input.categoryTags],
          id: input.projectId,
          ownerId: input.ownerId,
          productId: input.productId,
          status: 'EDITING',
          templateId: input.templateId,
          title: input.title,
        },
      })
      const revision = await database.projectRevision.create({
        data: {
          createdByUserId: input.ownerId,
          document: input.document,
          documentHash,
          id: input.revisionId,
          projectId: input.projectId,
          revisionNumber: 1,
        },
      })
      const project = await database.project.update({
        data: { latestRevisionId: revision.id },
        where: { id: input.projectId },
      })

      return { project, revision }
    }
    if (transaction) return create(transaction)

    return this.client.$transaction(create, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })
  }

  async findOwnedProject(projectId: string, ownerId: string) {
    return this.client.project.findFirst({
      include: { latestRevision: true },
      where: { deletedAt: null, id: projectId, ownerId },
    })
  }

  async findOwnedProjects(ownerId: string) {
    return this.client.project.findMany({
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      take: 50,
      where: { deletedAt: null, ownerId },
    })
  }

  async saveRevision(
    input: SaveProjectRevisionInput,
  ): Promise<SaveProjectRevisionResult> {
    try {
      return await this.saveRevisionTransaction(input)
    } catch (error: unknown) {
      if (!isPrismaWriteConflict(error)) throw error
      return this.resolveConflict(input)
    }
  }

  private async resolveConflict(
    input: SaveProjectRevisionInput,
  ): Promise<SaveProjectRevisionResult> {
    const requestHash = createRevisionRequestHash(input)
    const [project, revision] = await Promise.all([
      this.client.project.findFirst({
        select: { latestRevisionId: true },
        where: { deletedAt: null, id: input.projectId, ownerId: input.ownerId },
      }),
      this.client.projectRevision.findUnique({
        where: {
          projectId_clientMutationId: {
            clientMutationId: input.clientMutationId,
            projectId: input.projectId,
          },
        },
      }),
    ])

    if (!project?.latestRevisionId) return { kind: 'project_not_found' }
    if (revision) {
      return revision.requestHash === requestHash
        ? { kind: 'replayed', revision }
        : { kind: 'mutation_conflict' }
    }

    return {
      kind: 'revision_conflict',
      latestRevisionId: project.latestRevisionId,
    }
  }

  private async saveRevisionTransaction(
    input: SaveProjectRevisionInput,
  ): Promise<SaveProjectRevisionResult> {
    const documentHash = createDocumentHash(input.document)
    const requestHash = createRevisionRequestHash(input)

    return this.client.$transaction(
      async (transaction) => {
        const project = await transaction.project.findFirst({
          select: { latestRevisionId: true },
          where: {
            deletedAt: null,
            id: input.projectId,
            ownerId: input.ownerId,
          },
        })
        if (!project?.latestRevisionId) return { kind: 'project_not_found' }

        const existing = await transaction.projectRevision.findUnique({
          where: {
            projectId_clientMutationId: {
              clientMutationId: input.clientMutationId,
              projectId: input.projectId,
            },
          },
        })
        if (existing) {
          return existing.requestHash === requestHash
            ? { kind: 'replayed', revision: existing }
            : { kind: 'mutation_conflict' }
        }
        if (project.latestRevisionId !== input.baseRevisionId) {
          return {
            kind: 'revision_conflict',
            latestRevisionId: project.latestRevisionId,
          }
        }

        const baseRevision = await transaction.projectRevision.findFirst({
          select: { revisionNumber: true },
          where: { id: input.baseRevisionId, projectId: input.projectId },
        })
        if (!baseRevision) {
          return {
            kind: 'revision_conflict',
            latestRevisionId: project.latestRevisionId,
          }
        }

        const revision = await transaction.projectRevision.create({
          data: {
            baseRevisionId: input.baseRevisionId,
            clientMutationId: input.clientMutationId,
            createdByUserId: input.ownerId,
            document: input.document,
            documentHash,
            id: input.revisionId,
            projectId: input.projectId,
            requestHash,
            revisionNumber: baseRevision.revisionNumber + 1,
          },
        })
        const updated = await transaction.project.updateMany({
          data: { latestRevisionId: revision.id, status: 'EDITING' },
          where: {
            id: input.projectId,
            latestRevisionId: input.baseRevisionId,
            ownerId: input.ownerId,
          },
        })
        if (updated.count !== 1) throw new ConcurrentRevisionWriteError()

        return { kind: 'created', revision }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  }
}
