import type { BookDocumentV1 } from '@core/book/model'

import type { BookCommand } from './bookCommand'
import type { BookCommandCandidateResult } from './bookCommandApplication'

type BookAssetCommand = Extract<BookCommand, { type: 'add_assets' }>

export const createBookAssetCandidate = (
  document: BookDocumentV1,
  command: BookAssetCommand,
): BookCommandCandidateResult => {
  const existingAssetIds = new Set(
    document.assets.map(({ assetId }) => assetId),
  )
  const nextAssets = command.assetIds.flatMap((assetId) => {
    if (existingAssetIds.has(assetId)) return []

    existingAssetIds.add(assetId)
    return [{ assetId }]
  })

  if (nextAssets.length === 0) {
    return { ok: true, document }
  }

  return {
    ok: true,
    document: {
      ...document,
      assets: [...document.assets, ...nextAssets],
    },
  }
}
