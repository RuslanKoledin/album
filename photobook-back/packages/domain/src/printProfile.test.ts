import { describe, expect, it } from 'vitest'

import { createPrintProfileSnapshot, type PrintProfileV1 } from './index.js'
import {
  assertApprovedPrintProfile,
  InvalidPrintProfileError,
  validatePrintProfile,
} from './printProfileValidation.js'

function createMockPrintProfile(): PrintProfileV1 {
  return {
    catalogVersionId: 'mock-catalog-v0',
    cover: {
      canvasSizeMm: { height: 216, width: 430 },
      safeZoneMm: { bottom: 8, left: 8, right: 8, top: 8 },
      spineWidthMm: 8,
    },
    manufacturingApproval: null,
    output: {
      allowOverprint: false,
      allowTransparency: true,
      blackPolicy: 'mock-printer-managed',
      colorSpace: 'mock-srgb',
      documentLayout: 'spreads',
      embedFonts: true,
      iccProfileId: 'mock-srgb-v0',
      minimumEffectiveDpi: 240,
      pdfStandard: 'mock-pdf-v0',
    },
    page: {
      bleedMm: { bottom: 3, left: 3, right: 3, top: 3 },
      gutterSafeZoneMm: 8,
      safeZoneMm: { bottom: 8, left: 8, right: 8, top: 8 },
      trimSizeMm: { height: 200, width: 200 },
    },
    productSpecId: 'mock-standard-hardcover-v0',
    productionStatus: 'mock',
    profileId: 'mock-print-profile',
    revision: 1,
    schemaVersion: 1,
    spreadCount: { max: 20, min: 10, step: 2 },
  }
}

describe('print profile', () => {
  it('derives a stable immutable version from complete profile content', () => {
    const profile = createMockPrintProfile()
    const first = createPrintProfileSnapshot(profile)
    const second = createPrintProfileSnapshot(structuredClone(profile))

    expect(second).toEqual(first)
    expect(first.renderProfileVersion).toBe(
      `rpf_${first.contentHash.replace('sha256:', '')}`,
    )

    const changed: PrintProfileV1 = {
      ...profile,
      page: { ...profile.page, gutterSafeZoneMm: 9 },
    }
    expect(createPrintProfileSnapshot(changed).renderProfileVersion).not.toBe(
      first.renderProfileVersion,
    )
  })

  it('rejects unsafe geometry and an unreachable spread increment', () => {
    const original = createMockPrintProfile()
    const profile: PrintProfileV1 = {
      ...original,
      page: {
        ...original.page,
        safeZoneMm: {
          bottom: 8,
          left: 100,
          right: 100,
          top: 8,
        },
      },
      spreadCount: { max: 20, min: 9, step: 2 },
    }

    expect(validatePrintProfile(profile).issues).toEqual(
      expect.arrayContaining([
        { code: 'geometry_invalid', path: '/page/safeZoneMm' },
        { code: 'spread_count_invalid', path: '/spreadCount' },
      ]),
    )
  })

  it('does not allow a mock profile to activate production rendering', () => {
    const profile = createMockPrintProfile()

    expect(() => assertApprovedPrintProfile(profile)).toThrow(
      InvalidPrintProfileError,
    )
  })

  it('requires manufacturing evidence for an approved profile', () => {
    const mockProfile = createMockPrintProfile()
    const profile: PrintProfileV1 = {
      ...mockProfile,
      productionStatus: 'approved',
    }

    expect(validatePrintProfile(profile).issues).toContainEqual({
      code: 'approval_invalid',
      path: '/manufacturingApproval',
    })

    const approvedProfile: PrintProfileV1 = {
      ...profile,
      manufacturingApproval: {
        approvedAt: '2026-07-23T10:00:00.000Z',
        evidenceId: 'evidence-print-proof-1',
        partnerId: 'partner-bishkek-1',
        productionOwnerId: 'production-owner-1',
      },
    }
    expect(() => assertApprovedPrintProfile(approvedProfile)).not.toThrow()
  })
})
