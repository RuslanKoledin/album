import { describe, expect, it } from 'vitest'

import { createMinimalBookDocumentV1Fixture } from '@mocks/book'

import { createHttpContractValidator } from '@tests/contracts/httpContract'
import {
  DEMO_PROJECT_ID,
  createDemoProjectDetail,
  createProjectRequestFixture,
} from './projectFixtures'
import {
  createMockProject,
  getMockProject,
  resetProjectMockState,
  saveMockProjectDocument,
} from './projectMockState'

describe('project MSW fixtures', () => {
  it('matches the frozen project request and response schemas', () => {
    const validateRequest = createHttpContractValidator('createProjectRequest')
    const validateResponse = createHttpContractValidator('projectDetail')

    expect(validateRequest(createProjectRequestFixture)).toBe(true)
    expect(validateResponse(createDemoProjectDetail())).toBe(true)

    const created = createMockProject(
      createProjectRequestFixture,
      'mock-idempotency-contract-01',
    )
    expect(created.kind).toBe('success')
    if (created.kind === 'success') {
      expect(validateResponse(created.value)).toBe(true)
    }
  })

  it('matches the frozen autosave request and response schemas', () => {
    resetProjectMockState()
    const project = getMockProject(DEMO_PROJECT_ID)
    expect(project).toBeDefined()
    if (!project) return

    const request = {
      baseRevisionId: project.latestRevision.id,
      clientMutationId: 'mock-mutation-contract-01',
      document: createMinimalBookDocumentV1Fixture(),
    }
    const validateRequest = createHttpContractValidator(
      'saveProjectDocumentRequest',
    )
    const validateResponse = createHttpContractValidator(
      'saveProjectDocumentResponse',
    )

    expect(validateRequest(request)).toBe(true)
    const saved = saveMockProjectDocument(DEMO_PROJECT_ID, request)
    expect(saved.kind).toBe('success')
    if (saved.kind === 'success') {
      expect(validateResponse(saved.value)).toBe(true)
    }
  })
})
