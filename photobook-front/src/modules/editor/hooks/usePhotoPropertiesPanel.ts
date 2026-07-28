import { useState } from 'react'

import {
  calculateEffectivePhotoDpi,
  type BookDocumentV1,
  type NormalizedPoint,
  type NormalizedRect,
  type PhotoSlot,
} from '@core/book'
import type { AssetDto } from '@modules/photo-upload'

import {
  createCropFromZoomAndFocalPoint,
  getMockPhotoPixelSize,
  getPhotoSlotUsages,
  getVisiblePhotoAssets,
  getZoomFromCrop,
  MOCK_MIN_PRINT_DPI,
  type PhotoAdjustmentPreview,
} from '@editor/libs'
import type { PhotoFilter, PhotoSlotUsage } from '@editor/model'

interface UsePhotoPropertiesPanelInput {
  readonly adjustmentPreview: PhotoAdjustmentPreview | null
  readonly assetDetails: readonly AssetDto[]
  readonly document: BookDocumentV1
  readonly onApplyCrop: (crop: NormalizedRect) => void
  readonly onAssignPhoto: (assetId: string) => void
  readonly onCommitFocalPoint: (
    focalPoint: NormalizedPoint,
    crop: NormalizedRect,
  ) => void
  readonly onPreviewAdjustment: (preview: PhotoAdjustmentPreview | null) => void
  readonly onSwapPhoto: (secondPhotoSlotId: string) => void
  readonly selectedPhotoSlot: PhotoSlot
}

export const usePhotoPropertiesPanel = ({
  adjustmentPreview,
  assetDetails,
  document,
  onApplyCrop,
  onAssignPhoto,
  onCommitFocalPoint,
  onPreviewAdjustment,
  onSwapPhoto,
  selectedPhotoSlot,
}: UsePhotoPropertiesPanelInput) => {
  const [filter, setFilter] = useState<PhotoFilter>('all')
  const [isCropping, setIsCropping] = useState(false)
  const [pendingSwap, setPendingSwap] = useState<PhotoSlotUsage | null>(null)
  const [zoom, setZoom] = useState(() =>
    getZoomFromCrop(selectedPhotoSlot.crop),
  )
  const slotUsages = getPhotoSlotUsages(document)
  const usedAssetIds = new Set(
    slotUsages.flatMap(({ slot }) => (slot.assetId ? [slot.assetId] : [])),
  )
  const usedAssets = document.assets.filter(({ assetId }) =>
    usedAssetIds.has(assetId),
  )
  const unusedAssets = document.assets.filter(
    ({ assetId }) => !usedAssetIds.has(assetId),
  )
  const activeAdjustment =
    adjustmentPreview?.photoSlotId === selectedPhotoSlot.id
      ? adjustmentPreview
      : null
  const displayedCrop = activeAdjustment?.crop ?? selectedPhotoSlot.crop
  const selectedAsset = assetDetails.find(
    ({ assetId }) => assetId === selectedPhotoSlot.assetId,
  )
  const pixelSize =
    selectedAsset?.pixelHeight && selectedAsset.pixelWidth
      ? { height: selectedAsset.pixelHeight, width: selectedAsset.pixelWidth }
      : getMockPhotoPixelSize(selectedPhotoSlot.assetId)
  const effectiveDpi = pixelSize
    ? calculateEffectivePhotoDpi({
        crop: displayedCrop,
        frameMm: selectedPhotoSlot.frameMm,
        pixelSize,
      })
    : null

  const previewAdjustment = (nextZoom: number, focalPoint: NormalizedPoint) =>
    onPreviewAdjustment({
      photoSlotId: selectedPhotoSlot.id,
      crop: createCropFromZoomAndFocalPoint(nextZoom, focalPoint),
      focalPoint,
    })

  return {
    activeAdjustment,
    displayedFocalPoint:
      activeAdjustment?.focalPoint ?? selectedPhotoSlot.focalPoint,
    effectiveDpi,
    filter,
    hasResolutionWarning:
      effectiveDpi !== null && effectiveDpi < MOCK_MIN_PRINT_DPI,
    isCropping,
    pendingSwap,
    slotUsages,
    unusedAssets,
    usedAssetIds,
    usedAssets,
    visibleAssets: getVisiblePhotoAssets(document, filter, usedAssetIds),
    zoom,
    applyCrop: () => {
      onApplyCrop(
        activeAdjustment?.crop ??
          createCropFromZoomAndFocalPoint(zoom, selectedPhotoSlot.focalPoint),
      )
      setIsCropping(false)
      onPreviewAdjustment(null)
    },
    assignOrPrepareSwap: (assetId: string, swapTarget?: PhotoSlotUsage) => {
      if (swapTarget) setPendingSwap(swapTarget)
      else {
        setPendingSwap(null)
        onAssignPhoto(assetId)
      }
    },
    cancelCrop: () => {
      setIsCropping(false)
      setZoom(getZoomFromCrop(selectedPhotoSlot.crop))
      onPreviewAdjustment(null)
    },
    cancelPreview: () => onPreviewAdjustment(null),
    changeZoom: (nextZoom: number) => {
      setZoom(nextZoom)
      previewAdjustment(nextZoom, selectedPhotoSlot.focalPoint)
    },
    clearPendingSwap: () => setPendingSwap(null),
    commitFocalPoint: (focalPoint: NormalizedPoint) => {
      const crop = createCropFromZoomAndFocalPoint(
        getZoomFromCrop(selectedPhotoSlot.crop),
        focalPoint,
      )
      onCommitFocalPoint(focalPoint, crop)
      onPreviewAdjustment(null)
    },
    confirmSwap: () => {
      if (!pendingSwap) return
      onSwapPhoto(pendingSwap.slot.id)
      setPendingSwap(null)
    },
    previewFocalPoint: (focalPoint: NormalizedPoint) =>
      previewAdjustment(getZoomFromCrop(selectedPhotoSlot.crop), focalPoint),
    setFilter,
    startCropping: () => {
      setIsCropping(true)
      setPendingSwap(null)
      const currentZoom = getZoomFromCrop(selectedPhotoSlot.crop)
      setZoom(currentZoom)
      previewAdjustment(currentZoom, selectedPhotoSlot.focalPoint)
    },
  }
}
