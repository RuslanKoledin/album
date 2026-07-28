import type { AssetReference, PhotoSlot } from '@core/book'
import type { AssetDto } from '@modules/photo-upload'

import {
  getAssetUsageLabel,
  getPhotoLabel,
  getPhotoPalette,
} from '@editor/libs'
import type { PhotoSlotUsage } from '@editor/model'

interface PhotoLibraryGridProps {
  readonly assets: readonly AssetReference[]
  readonly assetDetails: readonly AssetDto[]
  readonly allAssets: readonly AssetReference[]
  readonly disabled: boolean
  readonly selectedPhotoSlot: PhotoSlot
  readonly slotUsages: readonly PhotoSlotUsage[]
  readonly usedAssetIds: ReadonlySet<string>
  readonly onSelect: (assetId: string, swapTarget?: PhotoSlotUsage) => void
}

const getAssetStateLabel = (asset: AssetDto | undefined) => {
  if (!asset || asset.status === 'ready') return null
  if (asset.status === 'failed' || asset.status === 'deleted')
    return 'Превью недоступно'
  return 'Обрабатываем фото'
}

export function PhotoLibraryGrid({
  allAssets,
  assets,
  assetDetails,
  disabled,
  selectedPhotoSlot,
  slotUsages,
  usedAssetIds,
  onSelect,
}: PhotoLibraryGridProps) {
  if (assets.length === 0) {
    return (
      <p className="mt-4 rounded-xl bg-paper-100 p-4 text-sm text-ink-700">
        Все фотографии уже используются в книге.
      </p>
    )
  }

  return (
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
      {assets.map((asset) => {
        const assetIndex = allAssets.findIndex(
          ({ assetId }) => assetId === asset.assetId,
        )
        const label = getPhotoLabel(assetIndex)
        const usage = getAssetUsageLabel(asset, selectedPhotoSlot, usedAssetIds)
        const isCurrent = asset.assetId === selectedPhotoSlot.assetId
        const swapTarget = slotUsages.find(
          ({ slot }) =>
            slot.id !== selectedPhotoSlot.id && slot.assetId === asset.assetId,
        )
        const [startColor, endColor] = getPhotoPalette(asset.assetId)
        const details = assetDetails.find(
          ({ assetId }) => assetId === asset.assetId,
        )
        const stateLabel = getAssetStateLabel(details)
        const isReady = !details || details.status === 'ready'
        const presentationLabel = stateLabel ?? usage

        return (
          <button
            aria-label={`${label}, ${presentationLabel}${swapTarget && isReady ? ' — поменять местами' : ''}`}
            aria-pressed={isCurrent}
            className={`min-h-24 rounded-xl border bg-surface p-2 text-left transition-colors ${
              isCurrent
                ? 'border-accent-600 ring-1 ring-accent-600'
                : swapTarget
                  ? 'border-border hover:border-warning'
                  : 'border-border hover:border-control-border'
            } disabled:opacity-55`}
            disabled={disabled || isCurrent || !isReady}
            key={asset.assetId}
            type="button"
            onClick={() => onSelect(asset.assetId, swapTarget)}
          >
            {details?.thumbnailUrl && details.status === 'ready' ? (
              <img
                alt=""
                className="block h-14 w-full rounded-lg object-cover"
                src={details.thumbnailUrl}
              />
            ) : (
              <span
                aria-hidden="true"
                className="block h-14 rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${startColor}, ${endColor})`,
                }}
              />
            )}
            <span className="mt-2 block text-[0.6875rem] font-medium">
              {label}
            </span>
            <span className="mt-0.5 block text-[0.625rem] text-ink-500">
              {stateLabel ?? (swapTarget ? `${usage} · обмен` : usage)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
