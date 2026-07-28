export interface ProductOptionSelection {
  readonly optionId: string
  readonly valueId: string
}

export interface CreateProjectRequest {
  readonly catalogVersion: string
  readonly categoryTags: readonly string[]
  readonly optionSelections: readonly ProductOptionSelection[]
  readonly productId: string
  readonly spreadCount: number
  readonly templateId: string
}

export interface ResolvedProjectConfiguration {
  readonly productSpecId: string
  readonly themeId: string
}

export interface SaveProjectDocumentRequest {
  readonly baseRevisionId: string
  readonly clientMutationId: string
  readonly document: unknown
}
