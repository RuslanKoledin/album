import { describe, expect, it } from 'vitest'

import {
  DEMO_PROJECT_ID,
  getMockProject,
  resetProjectMockState,
} from '@mocks/project'
import {
  createMockApproval,
  createMockPreflightRun,
  resetProjectReviewMockState,
} from '@mocks/project-review'
import { createMockPriceQuote, resetPricingMockState } from '@mocks/pricing'

import {
  createMockOrder,
  getMockOrderContext,
  resetOrderMockState,
} from './orderMockState'

describe('order mock state', () => {
  it('requires latest approval and replays one identical order', () => {
    resetProjectMockState()
    resetProjectReviewMockState()
    resetOrderMockState()
    resetPricingMockState()
    const project = getMockProject(DEMO_PROJECT_ID)
    expect(project).toBeDefined()
    if (!project) return

    const selection = project.latestRevision.document.productSelection
    const quote = createMockPriceQuote({
      productId: selection.productId,
      productSpecId: selection.productSpecId,
      catalogVersion: selection.catalogVersion,
      spreadCount: project.latestRevision.document.spreads.length,
      options: selection.optionSelections,
      quantity: 1,
      delivery: { method: 'pickup', city: 'Bishkek' },
    })
    expect(quote.kind).toBe('success')
    if (quote.kind !== 'success') return

    const request = {
      projectId: DEMO_PROJECT_ID,
      approvedRevisionId: project.latestRevision.id,
      priceQuoteId: quote.value.quoteId,
      quantity: 1 as const,
      contact: { name: 'Айжан', phone: '+996555123456' },
      delivery: {
        method: 'pickup' as const,
        city: 'Bishkek' as const,
        address: null,
      },
      customerComment: null,
      approvedLayoutConfirmed: true as const,
      mockConditionsAcknowledged: true as const,
    }
    expect(createMockOrder(request, 'mock-order-key').kind).toBe(
      'approval_required',
    )

    const preflight = createMockPreflightRun(
      DEMO_PROJECT_ID,
      project.latestRevision.id,
    )
    expect(preflight.kind).toBe('success')
    if (preflight.kind !== 'success') return
    createMockApproval(DEMO_PROJECT_ID, {
      revisionId: project.latestRevision.id,
      preflightRunId: preflight.value.id,
      checklist: {
        namesChecked: true,
        datesChecked: true,
        captionsChecked: true,
        pageOrderChecked: true,
        cropUnderstood: true,
        readyForPrint: true,
      },
      acknowledgedWarningIds: [],
    })

    expect(
      createMockOrder(
        { ...request, priceQuoteId: 'mock-price-quote-missing' },
        'mock-invalid-price-key',
      ).kind,
    ).toBe('price_quote_invalid')

    const created = createMockOrder(request, 'mock-order-key')
    const replayed = createMockOrder(request, 'mock-order-key')
    expect(created.kind).toBe('success')
    expect(replayed).toEqual(created)
    if (created.kind !== 'success') return
    expect(getMockOrderContext(created.value.id)).toMatchObject({
      approval: { approvedRevisionId: project.latestRevision.id },
      preflightRun: { revisionId: project.latestRevision.id },
      project: {
        latestRevision: { id: project.latestRevision.id },
      },
    })
  })
})
