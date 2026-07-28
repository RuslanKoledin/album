import type { BookDocumentV1 } from '@core/book'
import type { ProjectDetailDto } from '@modules/project'

export interface EditorProjectSnapshot {
  readonly projectId: string
  readonly revisionId: string
  readonly title: string
  readonly document: BookDocumentV1
}

export const mapProjectDetailToEditorProject = (
  detail: ProjectDetailDto,
): EditorProjectSnapshot => ({
  projectId: detail.project.id,
  revisionId: detail.latestRevision.id,
  title: detail.project.title,
  document: structuredClone(detail.latestRevision.document),
})
