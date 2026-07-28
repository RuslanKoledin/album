import type { BookDocumentV1, ProductOptionSelection } from '@core/book'
import type { CursorPageInfoDto } from '@shared/api'

export type ProjectStatus =
  | 'draft'
  | 'awaiting_upload'
  | 'uploading'
  | 'editing'
  | 'ready_for_review'
  | 'approved'
  | 'archived'
  | 'deleted'

export interface ProjectDto {
  readonly id: string
  readonly ownerId: string
  readonly title: string
  readonly status: ProjectStatus
  readonly productId: string
  readonly templateId: string
  readonly categoryTags: readonly string[]
  readonly catalogVersion: string
  readonly latestRevisionId: string
  readonly approvedRevisionId: string | null
  readonly coverPreviewUrl: string | null
  readonly createdAt: string
  readonly updatedAt: string
  readonly deletedAt: string | null
}

export interface ProjectRevisionDto {
  readonly id: string
  readonly projectId: string
  readonly revisionNumber: number
  readonly document: BookDocumentV1
  readonly documentHash: string
  readonly createdAt: string
}

export interface ProjectDetailDto {
  readonly project: ProjectDto
  readonly latestRevision: ProjectRevisionDto
}

export interface ProjectListResponseDto {
  readonly items: readonly ProjectDto[]
  readonly pageInfo: CursorPageInfoDto
}

export interface CreateProjectRequestDto {
  readonly productId: string
  readonly templateId: string
  readonly catalogVersion: string
  readonly categoryTags: readonly string[]
  readonly spreadCount: number
  readonly optionSelections: readonly ProductOptionSelection[]
}

export interface CreateProjectArgs {
  readonly body: CreateProjectRequestDto
  readonly csrfToken: string
  readonly idempotencyKey: string
}

export interface SaveProjectDocumentRequestDto {
  readonly baseRevisionId: string
  readonly clientMutationId: string
  readonly document: BookDocumentV1
}

export interface SaveProjectDocumentResponseDto {
  readonly revisionId: string
  readonly revisionNumber: number
  readonly savedAt: string
  readonly documentHash: string
}

export interface SaveProjectDocumentArgs {
  readonly projectId: string
  readonly csrfToken: string
  readonly body: SaveProjectDocumentRequestDto
}
