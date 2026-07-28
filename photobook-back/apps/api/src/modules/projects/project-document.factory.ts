import { readContractArtifactJson } from '@photobook/contracts'

import type {
  CreateProjectRequest,
  ResolvedProjectConfiguration,
} from './project.types.js'

const DOCUMENT_FIXTURE =
  'fixtures/book-document/v1/valid/minimal-standard-hardcover.json'

interface MutableDocument {
  assets: { assetId: string }[]
  metadata: { title: string }
  productSelection: {
    catalogVersion: string
    optionSelections: { optionId: string; valueId: string }[]
    productId: string
    productSpecId: string
    templateId: string
    themeId: string
  }
  spreads: {
    id: string
    photoSlots: { assetId: string; id: string }[]
  }[]
}

function createSpread(
  source: MutableDocument['spreads'][number],
  index: number,
) {
  const suffix = String(index + 1).padStart(2, '0')
  const assetId = `mock-asset-spread-${suffix}`
  const spread = structuredClone(source)
  spread.id = `mock-spread-${suffix}`
  spread.photoSlots = spread.photoSlots.map((slot, slotIndex) => ({
    ...slot,
    assetId,
    id: `mock-spread-${suffix}-photo-slot-${String(slotIndex + 1).padStart(2, '0')}`,
  }))

  return { assetId, spread }
}

export function createInitialProjectDocument(
  request: CreateProjectRequest,
  configuration: ResolvedProjectConfiguration,
) {
  const document = structuredClone(
    readContractArtifactJson(DOCUMENT_FIXTURE),
  ) as MutableDocument
  document.metadata.title = 'Новая фотокнига'
  document.productSelection = {
    catalogVersion: request.catalogVersion,
    optionSelections: request.optionSelections.map((item) => ({ ...item })),
    productId: request.productId,
    productSpecId: configuration.productSpecId,
    templateId: request.templateId,
    themeId: configuration.themeId,
  }
  const sourceSpread = document.spreads[0]
  if (!sourceSpread) throw new Error('Initial document fixture has no spread')
  const spreads = Array.from({ length: request.spreadCount }, (_, index) =>
    createSpread(sourceSpread, index),
  )
  document.spreads = spreads.map(({ spread }) => spread)
  document.assets = [
    { assetId: 'mock-asset-cover' },
    ...spreads.map(({ assetId }) => ({ assetId })),
  ]

  return document
}
