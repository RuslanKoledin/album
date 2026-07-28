import { createJsonHash } from './canonicalJson.js'

export interface RevisionRequestFingerprint {
  readonly baseRevisionId: string
  readonly document: unknown
}

export function createDocumentHash(document: unknown) {
  return `sha256:${createJsonHash(document)}`
}

export function createRevisionRequestHash(request: RevisionRequestFingerprint) {
  return createJsonHash({
    baseRevisionId: request.baseRevisionId,
    document: request.document,
  })
}
