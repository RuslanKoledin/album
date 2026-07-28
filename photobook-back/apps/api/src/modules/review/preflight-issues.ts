import { randomUUID } from 'node:crypto'

import {
  calculateEffectivePhotoDpi,
  type BookDocument,
  type BookValidationIssue,
} from '@photobook/domain'

import type { PreflightIssue } from './review.types.js'

const MINIMUM_PRINT_DPI = 240

interface AssetDimensions {
  readonly id: string
  readonly pixelHeight: number | null
  readonly pixelWidth: number | null
  readonly status: string
}

function getSurface(document: BookDocument, path: string) {
  if (path.startsWith('/cover')) {
    return { id: 'cover', surface: document.cover }
  }
  const index = Number(path.match(/^\/spreads\/(\d+)/)?.[1])
  if (!Number.isInteger(index)) return { id: null, surface: undefined }
  const surface = document.spreads[index]

  return { id: surface?.id ?? null, surface }
}

function getElementId(document: BookDocument, path: string) {
  const { surface } = getSurface(document, path)
  const photoIndex = Number(path.match(/\/photoSlots\/(\d+)/)?.[1])
  if (Number.isInteger(photoIndex)) {
    return surface?.photoSlots[photoIndex]?.id ?? null
  }
  const textIndex = Number(path.match(/\/textBlocks\/(\d+)/)?.[1])
  if (Number.isInteger(textIndex)) {
    return surface?.textBlocks[textIndex]?.id ?? null
  }

  return null
}

const getMessageKey = (code: string) =>
  `preflight.${code.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())}`

function mapValidationIssue(
  document: BookDocument,
  issue: BookValidationIssue,
): PreflightIssue {
  return {
    code: issue.code.toUpperCase(),
    details: {},
    elementId: getElementId(document, issue.path),
    id: randomUUID(),
    messageKey: getMessageKey(issue.code),
    severity: 'blocking',
    surfaceId: getSurface(document, issue.path).id,
  }
}

function createResolutionIssues(
  document: BookDocument,
  assets: readonly AssetDimensions[],
) {
  const dimensions = new Map(
    assets.flatMap((asset) =>
      asset.status === 'READY' && asset.pixelWidth && asset.pixelHeight
        ? [
            [
              asset.id,
              { height: asset.pixelHeight, width: asset.pixelWidth },
            ] as const,
          ]
        : [],
    ),
  )
  const surfaces = [
    { id: 'cover', surface: document.cover },
    ...document.spreads.map((surface) => ({ id: surface.id, surface })),
  ]

  return surfaces.flatMap(({ id, surface }) =>
    surface.photoSlots.flatMap((slot) => {
      const pixelSize = slot.assetId ? dimensions.get(slot.assetId) : undefined
      if (!pixelSize) return []
      const actualDpi = calculateEffectivePhotoDpi({
        crop: slot.crop,
        frameMm: slot.frameMm,
        pixelSize,
      })
      if (actualDpi >= MINIMUM_PRINT_DPI) return []

      return [
        {
          code: 'PHOTO_RESOLUTION_LOW',
          details: { actualDpi, requiredDpi: MINIMUM_PRINT_DPI },
          elementId: slot.id,
          id: randomUUID(),
          messageKey: 'preflight.photoResolutionLow',
          severity: 'warning',
          surfaceId: id,
        } satisfies PreflightIssue,
      ]
    }),
  )
}

export function createPreflightIssues(
  document: BookDocument,
  validationIssues: readonly BookValidationIssue[],
  assets: readonly AssetDimensions[],
) {
  return [
    ...validationIssues.map((issue) => mapValidationIssue(document, issue)),
    ...createResolutionIssues(document, assets),
  ]
}
