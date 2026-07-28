interface ProjectRecord {
  readonly approvedRevisionId: string | null
  readonly catalogVersionId: string
  readonly categoryTags: readonly string[]
  readonly createdAt: Date
  readonly deletedAt: Date | null
  readonly id: string
  readonly latestRevisionId: string | null
  readonly ownerId: string
  readonly productId: string
  readonly status: string
  readonly templateId: string
  readonly title: string
  readonly updatedAt: Date
}

interface RevisionRecord {
  readonly createdAt: Date
  readonly document: unknown
  readonly documentHash: string
  readonly id: string
  readonly projectId: string
  readonly revisionNumber: number
}

export function mapProjectDetail(
  project: ProjectRecord,
  revision: RevisionRecord,
) {
  if (!project.latestRevisionId) {
    throw new Error('Project has no latest revision')
  }

  return {
    latestRevision: {
      createdAt: revision.createdAt.toISOString(),
      document: revision.document,
      documentHash: revision.documentHash,
      id: revision.id,
      projectId: revision.projectId,
      revisionNumber: revision.revisionNumber,
    },
    project: mapProject(project),
  }
}

export function mapProject(project: ProjectRecord) {
  if (!project.latestRevisionId) {
    throw new Error('Project has no latest revision')
  }

  return {
    approvedRevisionId: project.approvedRevisionId,
    catalogVersion: project.catalogVersionId,
    categoryTags: [...project.categoryTags],
    coverPreviewUrl: null,
    createdAt: project.createdAt.toISOString(),
    deletedAt: project.deletedAt?.toISOString() ?? null,
    id: project.id,
    latestRevisionId: project.latestRevisionId,
    ownerId: project.ownerId,
    productId: project.productId,
    status: project.status.toLowerCase(),
    templateId: project.templateId,
    title: project.title,
    updatedAt: project.updatedAt.toISOString(),
  }
}
