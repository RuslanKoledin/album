import { describe, expect, it } from 'vitest'

import {
  DEMO_PROJECT_ID,
  getMockProject,
  resetProjectMockState,
  saveMockProjectDocument,
} from '@mocks/project'

import {
  createMockApproval,
  createMockPreflightRun,
  resetProjectReviewMockState,
} from './projectReviewMockState'

describe('project review mock state', () => {
  it('keeps approval on its immutable revision after a later save', () => {
    resetProjectMockState()
    resetProjectReviewMockState()
    const initial = getMockProject(DEMO_PROJECT_ID)
    expect(initial).toBeDefined()
    if (!initial) return

    const preflight = createMockPreflightRun(
      DEMO_PROJECT_ID,
      initial.latestRevision.id,
    )
    expect(preflight.kind).toBe('success')
    if (preflight.kind !== 'success') return

    const approval = createMockApproval(DEMO_PROJECT_ID, {
      revisionId: initial.latestRevision.id,
      preflightRunId: preflight.value.id,
      checklist: {
        namesChecked: true,
        datesChecked: true,
        captionsChecked: true,
        pageOrderChecked: true,
        cropUnderstood: true,
        readyForPrint: true,
      },
      acknowledgedWarningIds: preflight.value.issues
        .filter(({ severity }) => severity === 'warning')
        .map(({ id }) => id),
    })
    expect(approval.kind).toBe('created')
    expect(getMockProject(DEMO_PROJECT_ID)?.project.status).toBe('approved')

    const save = saveMockProjectDocument(DEMO_PROJECT_ID, {
      baseRevisionId: initial.latestRevision.id,
      clientMutationId: 'mock-mutation-after-approval',
      document: {
        ...initial.latestRevision.document,
        metadata: { title: 'Новая версия после утверждения' },
      },
    })
    expect(save.kind).toBe('success')

    const changed = getMockProject(DEMO_PROJECT_ID)
    expect(changed?.project.status).toBe('editing')
    expect(changed?.project.approvedRevisionId).toBe(initial.latestRevision.id)
    expect(changed?.project.latestRevisionId).not.toBe(
      initial.latestRevision.id,
    )
  })
})
