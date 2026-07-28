import type {
  BookDocumentV1,
  NormalizedPoint,
  NormalizedRect,
  PhotoSlot,
} from '@core/book'
import type { AssetDto } from '@modules/photo-upload'

import { PhotoFocalPointControl } from '@editor-ui/PhotoFocalPointControl'
import { usePhotoPropertiesPanel } from '@editor/hooks'
import type { PhotoAdjustmentPreview } from '@editor/libs'

import { PhotoCropControls } from './PhotoCropControls'
import { PhotoFilterTabs } from './PhotoFilterTabs'
import { PhotoLibraryGrid } from './PhotoLibraryGrid'
import { PhotoQualityWarning } from './PhotoQualityWarning'
import { PhotoSwapConfirmation } from './PhotoSwapConfirmation'

interface PhotoPropertiesPanelProps {
  readonly adjustmentPreview: PhotoAdjustmentPreview | null
  readonly assetDetails: readonly AssetDto[]
  readonly assetsError: boolean
  readonly assetsLoading: boolean
  readonly commandError: string | null
  readonly document: BookDocumentV1
  readonly onApplyCrop: (crop: NormalizedRect) => void
  readonly onAssignPhoto: (assetId: string) => void
  readonly onCommitFocalPoint: (
    focalPoint: NormalizedPoint,
    crop: NormalizedRect,
  ) => void
  readonly onPreviewAdjustment: (preview: PhotoAdjustmentPreview | null) => void
  readonly onRemovePhoto: () => void
  readonly onRetryAssets: () => void
  readonly onSwapPhoto: (secondPhotoSlotId: string) => void
  readonly selectedPhotoSlot: PhotoSlot
}

export function PhotoPropertiesPanel(props: PhotoPropertiesPanelProps) {
  const panel = usePhotoPropertiesPanel(props)
  const { document, selectedPhotoSlot } = props

  return (
    <div className="mt-5">
      <div>
        <h3 className="font-semibold">Фотография</h3>
        <p className="mt-1 text-xs text-ink-500">
          Выбранный фотослот на текущей странице
        </p>
      </div>
      {panel.hasResolutionWarning && panel.effectiveDpi !== null && (
        <PhotoQualityWarning effectiveDpi={panel.effectiveDpi} />
      )}
      <PhotoFilterTabs
        allCount={document.assets.length}
        filter={panel.filter}
        unusedCount={panel.unusedAssets.length}
        usedCount={panel.usedAssets.length}
        onChange={panel.setFilter}
      />
      {props.assetsLoading && (
        <p
          className="mt-4 rounded-xl bg-paper-100 p-4 text-sm text-ink-700"
          role="status"
        >
          Готовим превью фотографий…
        </p>
      )}
      {props.assetsError && (
        <div
          className="mt-4 rounded-xl bg-warning-soft p-4 text-sm text-warning"
          role="alert"
        >
          <p>Не удалось загрузить превью. Фотографии остались в проекте.</p>
          <button
            className="mt-3 min-h-11 rounded-lg border border-warning px-3 font-semibold"
            type="button"
            onClick={props.onRetryAssets}
          >
            Повторить
          </button>
        </div>
      )}
      <PhotoLibraryGrid
        allAssets={document.assets}
        assetDetails={props.assetDetails}
        assets={panel.visibleAssets}
        disabled={props.assetsLoading || props.assetsError}
        selectedPhotoSlot={selectedPhotoSlot}
        slotUsages={panel.slotUsages}
        usedAssetIds={panel.usedAssetIds}
        onSelect={panel.assignOrPrepareSwap}
      />
      {panel.pendingSwap && (
        <PhotoSwapConfirmation
          target={panel.pendingSwap}
          onCancel={panel.clearPendingSwap}
          onConfirm={panel.confirmSwap}
        />
      )}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          className="min-h-11 rounded-xl border border-control-border px-3 text-sm font-medium hover:bg-paper-100 disabled:opacity-50"
          disabled={!selectedPhotoSlot.assetId}
          type="button"
          onClick={panel.startCropping}
        >
          Кадрировать
        </button>
        <button
          className="min-h-11 rounded-xl border border-control-border px-3 text-sm font-medium hover:bg-danger-soft hover:text-danger disabled:opacity-50"
          disabled={!selectedPhotoSlot.assetId}
          type="button"
          onClick={props.onRemovePhoto}
        >
          Убрать фото
        </button>
      </div>
      {props.commandError && (
        <p className="mt-4 text-sm text-danger" role="alert">
          {props.commandError}
        </p>
      )}
      {!panel.isCropping && selectedPhotoSlot.assetId && (
        <PhotoFocalPointControl
          assetId={selectedPhotoSlot.assetId}
          point={panel.displayedFocalPoint}
          onCancelPreview={panel.cancelPreview}
          onCommit={panel.commitFocalPoint}
          onPreview={panel.previewFocalPoint}
        />
      )}
      {panel.isCropping && selectedPhotoSlot.assetId && (
        <PhotoCropControls
          zoom={panel.zoom}
          onApply={panel.applyCrop}
          onCancel={panel.cancelCrop}
          onChangeZoom={panel.changeZoom}
        />
      )}
    </div>
  )
}
