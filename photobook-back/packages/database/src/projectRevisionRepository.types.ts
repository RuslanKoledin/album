import type { Project, ProjectRevision } from './generated/prisma/client.js'
import type { Prisma } from './generated/prisma/client.js'

export interface CreateProjectWithRevisionInput {
  readonly catalogVersionId: string
  readonly categoryTags: readonly string[]
  readonly document: Prisma.InputJsonValue
  readonly ownerId: string
  readonly productId: string
  readonly projectId: string
  readonly revisionId: string
  readonly templateId: string
  readonly title: string
}

export interface SaveProjectRevisionInput {
  readonly baseRevisionId: string
  readonly clientMutationId: string
  readonly document: Prisma.InputJsonValue
  readonly ownerId: string
  readonly projectId: string
  readonly revisionId: string
}

export interface ProjectWithRevision {
  readonly project: Project
  readonly revision: ProjectRevision
}

export type PhotobookTransactionClient = Prisma.TransactionClient

export type SaveProjectRevisionResult =
  | {
      readonly kind: 'created' | 'replayed'
      readonly revision: ProjectRevision
    }
  | {
      readonly kind: 'mutation_conflict'
    }
  | {
      readonly kind: 'project_not_found'
    }
  | {
      readonly kind: 'revision_conflict'
      readonly latestRevisionId: string
    }
