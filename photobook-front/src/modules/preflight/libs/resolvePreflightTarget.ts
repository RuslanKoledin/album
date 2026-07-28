import type {
  BookDocumentV1,
  BookSurface,
  BookDocumentValidationIssue,
} from '@core/book'

import type { LocalPreflightIssue } from '@preflight/model'

interface PreflightSurfaceTarget {
  readonly spreadIndex: number | null
  readonly surface: BookSurface | undefined
  readonly surfaceId: string | null
}

const resolveSurfaceTarget = (
  document: BookDocumentV1,
  path: string,
): PreflightSurfaceTarget => {
  if (path.startsWith('/cover')) {
    return { spreadIndex: null, surface: document.cover, surfaceId: 'cover' }
  }

  const spreadIndex = Number(path.match(/^\/spreads\/(\d+)/)?.[1])
  if (!Number.isInteger(spreadIndex)) {
    return { spreadIndex: null, surface: undefined, surfaceId: null }
  }

  const surface = document.spreads[spreadIndex]
  return {
    spreadIndex,
    surface,
    surfaceId: surface?.id ?? null,
  }
}

const resolveElement = (
  surface: BookSurface | undefined,
  path: string,
): Pick<LocalPreflightIssue, 'elementId' | 'elementKind'> => {
  const photoIndex = Number(path.match(/\/photoSlots\/(\d+)/)?.[1])
  if (Number.isInteger(photoIndex)) {
    return {
      elementId: surface?.photoSlots[photoIndex]?.id ?? null,
      elementKind: 'photo',
    }
  }

  const textIndex = Number(path.match(/\/textBlocks\/(\d+)/)?.[1])
  if (Number.isInteger(textIndex)) {
    return {
      elementId: surface?.textBlocks[textIndex]?.id ?? null,
      elementKind: 'text',
    }
  }

  return { elementId: null, elementKind: null }
}

export const createValidationPreflightIssue = (
  document: BookDocumentV1,
  issue: BookDocumentValidationIssue,
): LocalPreflightIssue => {
  const target = resolveSurfaceTarget(document, issue.path)
  const element = resolveElement(target.surface, issue.path)

  return {
    code: issue.code,
    ...element,
    id: `${issue.code}:${issue.path}`,
    path: issue.path,
    severity: 'error',
    spreadIndex: target.spreadIndex,
    surfaceId: target.surfaceId,
  }
}
