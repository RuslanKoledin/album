import { Prisma } from './generated/prisma/client.js'
import type { PhotobookPrismaClient } from './createPrismaClient.js'
import type {
  CreateApprovalInput,
  CreateApprovalResult,
  CreatePreflightRunInput,
  CreatePreflightRunResult,
} from './reviewRepository.types.js'

class ConcurrentReviewWriteError extends Error {}

const isWriteConflict = (error: unknown) =>
  error instanceof ConcurrentReviewWriteError ||
  (typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error.code === 'P2002' || error.code === 'P2034'))

export class ReviewRepository {
  constructor(private readonly client: PhotobookPrismaClient) {}

  async createApproval(
    input: CreateApprovalInput,
  ): Promise<CreateApprovalResult> {
    try {
      return await this.createApprovalTransaction(input)
    } catch (error: unknown) {
      if (!isWriteConflict(error)) throw error
      const existing = await this.client.approval.findUnique({
        where: { approvedRevisionId: input.approvedRevisionId },
      })
      if (!existing) {
        const project = await this.client.project.findFirst({
          select: { latestRevisionId: true },
          where: {
            deletedAt: null,
            id: input.projectId,
            ownerId: input.approvedByUserId,
          },
        })
        if (!project?.latestRevisionId) return { kind: 'not_found' }
        return {
          kind: 'revision_conflict',
          latestRevisionId: project.latestRevisionId,
        }
      }
      return existing.requestHash === input.requestHash
        ? { approval: existing, kind: 'replayed' }
        : { kind: 'request_conflict' }
    }
  }

  async createPreflightRun(
    input: CreatePreflightRunInput,
  ): Promise<CreatePreflightRunResult> {
    try {
      return await this.createPreflightRunTransaction(input)
    } catch (error: unknown) {
      if (!isWriteConflict(error)) throw error
      const project = await this.client.project.findFirst({
        select: { latestRevisionId: true },
        where: {
          deletedAt: null,
          id: input.projectId,
          ownerId: input.ownerId,
        },
      })
      if (!project?.latestRevisionId) return { kind: 'not_found' }
      return {
        kind: 'revision_conflict',
        latestRevisionId: project.latestRevisionId,
      }
    }
  }

  async findApprovalContext(
    projectId: string,
    preflightRunId: string,
    ownerId: string,
  ) {
    const project = await this.client.project.findFirst({
      select: { latestRevisionId: true },
      where: { deletedAt: null, id: projectId, ownerId },
    })
    if (!project?.latestRevisionId) return null
    const run = await this.client.preflightRun.findFirst({
      where: { id: preflightRunId, projectId },
    })

    return { latestRevisionId: project.latestRevisionId, run }
  }

  async findPreflightContext(projectId: string, ownerId: string) {
    return this.client.project.findFirst({
      include: {
        assets: {
          select: {
            id: true,
            pixelHeight: true,
            pixelWidth: true,
            status: true,
          },
          where: { deletedAt: null },
        },
        catalogVersion: { select: { payload: true, publishedAt: true } },
        latestRevision: true,
      },
      where: { deletedAt: null, id: projectId, ownerId },
    })
  }

  private async createApprovalTransaction(
    input: CreateApprovalInput,
  ): Promise<CreateApprovalResult> {
    return this.client.$transaction(
      async (transaction) => {
        const project = await transaction.project.findFirst({
          select: { latestRevisionId: true },
          where: {
            deletedAt: null,
            id: input.projectId,
            ownerId: input.approvedByUserId,
          },
        })
        if (!project?.latestRevisionId) return { kind: 'not_found' }
        if (project.latestRevisionId !== input.approvedRevisionId) {
          return {
            kind: 'revision_conflict',
            latestRevisionId: project.latestRevisionId,
          }
        }
        const run = await transaction.preflightRun.findFirst({
          select: { id: true },
          where: {
            id: input.preflightRunId,
            projectId: input.projectId,
            revisionId: input.approvedRevisionId,
            status: 'SUCCEEDED',
          },
        })
        if (!run) return { kind: 'not_found' }
        const existing = await transaction.approval.findUnique({
          where: { approvedRevisionId: input.approvedRevisionId },
        })
        if (existing) {
          return existing.requestHash === input.requestHash
            ? { approval: existing, kind: 'replayed' }
            : { kind: 'request_conflict' }
        }
        const approval = await transaction.approval.create({
          data: {
            acknowledgedWarningIds: [...input.acknowledgedWarningIds],
            approvedByUserId: input.approvedByUserId,
            approvedRevisionId: input.approvedRevisionId,
            checklist: input.checklist,
            id: input.approvalId,
            preflightRunId: input.preflightRunId,
            projectId: input.projectId,
            requestHash: input.requestHash,
          },
        })
        const updated = await transaction.project.updateMany({
          data: {
            approvedRevisionId: input.approvedRevisionId,
            status: 'APPROVED',
          },
          where: {
            id: input.projectId,
            latestRevisionId: input.approvedRevisionId,
            ownerId: input.approvedByUserId,
          },
        })
        if (updated.count !== 1) {
          throw new ConcurrentReviewWriteError()
        }

        return { approval, kind: 'created' }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  }

  private async createPreflightRunTransaction(
    input: CreatePreflightRunInput,
  ): Promise<CreatePreflightRunResult> {
    return this.client.$transaction(
      async (transaction) => {
        const project = await transaction.project.findFirst({
          select: { approvedRevisionId: true, latestRevisionId: true },
          where: {
            deletedAt: null,
            id: input.projectId,
            ownerId: input.ownerId,
          },
        })
        if (!project?.latestRevisionId) return { kind: 'not_found' }
        if (project.latestRevisionId !== input.revisionId) {
          return {
            kind: 'revision_conflict',
            latestRevisionId: project.latestRevisionId,
          }
        }
        const run = await transaction.preflightRun.create({
          data: {
            completedAt: new Date(),
            id: input.runId,
            issues: input.issues,
            projectId: input.projectId,
            revisionId: input.revisionId,
            status: 'SUCCEEDED',
          },
        })
        if (project.approvedRevisionId !== input.revisionId) {
          const updated = await transaction.project.updateMany({
            data: {
              status: input.hasBlockingIssues ? 'EDITING' : 'READY_FOR_REVIEW',
            },
            where: {
              id: input.projectId,
              latestRevisionId: input.revisionId,
              ownerId: input.ownerId,
            },
          })
          if (updated.count !== 1) throw new ConcurrentReviewWriteError()
        }

        return { kind: 'created', run }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  }
}
