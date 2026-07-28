import { createMinimalBookDocumentV1Fixture } from '@mocks/book'

import type { CreateProjectRequestDto, ProjectDetailDto } from '@project/model'

export const DEMO_PROJECT_ID = 'demo-project'
export const MOCK_CSRF_TOKEN = 'mock-csrf-token'

export const getMockCoverPreviewUrl = () => {
  const origin =
    typeof location === 'undefined' ? 'http://localhost' : location.origin
  return new URL('/images/demo/family-mountains.jpg', origin).toString()
}

export const createProjectRequestFixture: CreateProjectRequestDto = {
  productId: 'mock-standard-hardcover',
  templateId: 'mock-warm-family-story-v0',
  catalogVersion: 'mock-catalog-v0',
  categoryTags: ['family'],
  spreadCount: 1,
  optionSelections: [
    {
      optionId: 'mock-cover-material',
      valueId: 'mock-cover-material-sand',
    },
  ],
}

export const createDemoProjectDetail = (): ProjectDetailDto => {
  const minimalDocument = createMinimalBookDocumentV1Fixture()
  const document = {
    ...minimalDocument,
    assets: [
      ...minimalDocument.assets,
      { assetId: 'mock-asset-extra-01' },
      { assetId: 'mock-asset-extra-02' },
    ],
  }

  return {
    project: {
      id: DEMO_PROJECT_ID,
      ownerId: 'mock-user-01',
      title: document.metadata.title,
      status: 'editing',
      productId: document.productSelection.productId,
      templateId: document.productSelection.templateId,
      categoryTags: ['family'],
      catalogVersion: document.productSelection.catalogVersion,
      latestRevisionId: 'mock-revision-demo-01',
      approvedRevisionId: null,
      coverPreviewUrl: getMockCoverPreviewUrl(),
      createdAt: '2026-07-21T08:30:00Z',
      updatedAt: '2026-07-21T08:30:00Z',
      deletedAt: null,
    },
    latestRevision: {
      id: 'mock-revision-demo-01',
      projectId: DEMO_PROJECT_ID,
      revisionNumber: 1,
      document,
      documentHash: 'sha256:mock-document-demo-v1',
      createdAt: '2026-07-21T08:30:00Z',
    },
  }
}
