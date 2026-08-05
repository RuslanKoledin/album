import type {
  BookDocumentV1,
  LayoutSpec,
  NormalizedPoint,
  NormalizedRect,
  LayoutTextSlotSpec,
  PhotoSlot,
  Spread,
  TextBlock,
  TextStyleSpec,
  ThemeSpec,
} from '@core/book'
import type { AssetDto } from '@modules/photo-upload'
import { FiX } from 'react-icons/fi'

import { LayoutPropertiesPanel } from '@editor-ui/LayoutPropertiesPanel'
import { PhotoPropertiesPanel } from '@editor-ui/PhotoPropertiesPanel'
import { TextPropertiesPanel } from '@editor-ui/TextPropertiesPanel'
import { ThemePropertiesPanel } from '@editor-ui/ThemePropertiesPanel'
import type { PhotoAdjustmentPreview } from '@editor/libs'
import { MOBILE_EDITOR_TOOL_LABELS, type MobileEditorTool } from '@editor/model'

import { useMobilePropertiesPanelFocus } from './useMobilePropertiesPanelFocus'

interface PropertiesPanelProps {
  readonly assetDetails: readonly AssetDto[]
  readonly assetsError: boolean
  readonly assetsLoading: boolean
  readonly commandError: string | null
  readonly adjustmentPreview: PhotoAdjustmentPreview | null
  readonly activeSpread: Spread | undefined
  readonly compatibleLayouts: readonly LayoutSpec[]
  readonly document: BookDocumentV1
  readonly mobileTool: MobileEditorTool
  readonly mobileVisible: boolean
  readonly onAddPhotos: () => void
  readonly onCloseMobile: () => void
  readonly onApplyCrop: (crop: NormalizedRect) => void
  readonly onApplyLayout: (layoutId: string) => void
  readonly onApplyText: (text: string) => void
  readonly onAssignPhoto: (assetId: string) => void
  readonly onCommitFocalPoint: (
    focalPoint: NormalizedPoint,
    crop: NormalizedRect,
  ) => void
  readonly onPreviewAdjustment: (preview: PhotoAdjustmentPreview | null) => void
  readonly onRemovePhoto: () => void
  readonly onRetryAssets: () => void
  readonly onSwapPhoto: (secondPhotoSlotId: string) => void
  readonly selectedPhotoSlot: PhotoSlot | null
  readonly selectedTextBlock: TextBlock | null
  readonly selectedTextSlot: LayoutTextSlotSpec | undefined
  readonly selectedTextStyle: TextStyleSpec | undefined
  readonly theme: ThemeSpec | undefined
}

export function PropertiesPanel({
  assetDetails,
  assetsError,
  assetsLoading,
  commandError,
  adjustmentPreview,
  activeSpread,
  compatibleLayouts,
  document,
  mobileTool,
  mobileVisible,
  onAddPhotos,
  onCloseMobile,
  onApplyCrop,
  onApplyLayout,
  onApplyText,
  onAssignPhoto,
  onCommitFocalPoint,
  onPreviewAdjustment,
  onRemovePhoto,
  onRetryAssets,
  onSwapPhoto,
  selectedPhotoSlot,
  selectedTextBlock,
  selectedTextSlot,
  selectedTextStyle,
  theme,
}: PropertiesPanelProps) {
  const { closeButtonRef, panelRef } = useMobilePropertiesPanelFocus({
    open: mobileVisible,
    onClose: onCloseMobile,
  })

  return (
    <aside
      ref={panelRef}
      aria-labelledby="editor-properties-title"
      className={`${mobileVisible ? 'fixed' : 'hidden'} inset-x-2 bottom-[calc(4rem+max(0.5rem,env(safe-area-inset-bottom)))] z-30 order-3 max-h-[min(46dvh,30rem)] min-w-0 overflow-y-auto rounded-t-3xl border border-border bg-surface p-4 shadow-floating md:static md:col-start-2 md:block md:max-h-none md:rounded-none md:border-x-0 md:border-b-0 md:pb-4 md:shadow-none lg:order-none lg:col-start-auto lg:min-h-0 lg:overflow-y-auto lg:border-t-0 lg:border-l lg:p-6`}
      tabIndex={-1}
    >
      <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border md:hidden" />
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-ink-500 uppercase md:hidden">
            Настройки
          </p>
          <h2 className="text-lg font-semibold" id="editor-properties-title">
            <span className="md:hidden">
              {MOBILE_EDITOR_TOOL_LABELS[mobileTool]}
            </span>
            <span className="hidden md:inline">Свойства</span>
          </h2>
        </div>
        <button
          ref={closeButtonRef}
          aria-label="Закрыть настройки"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-lg transition-colors hover:bg-paper-100 md:hidden"
          type="button"
          onClick={onCloseMobile}
        >
          <FiX aria-hidden="true" />
        </button>
      </div>

      {selectedPhotoSlot ? (
        <PhotoPropertiesPanel
          adjustmentPreview={adjustmentPreview}
          assetDetails={assetDetails}
          assetsError={assetsError}
          assetsLoading={assetsLoading}
          commandError={commandError}
          document={document}
          key={selectedPhotoSlot.id}
          selectedPhotoSlot={selectedPhotoSlot}
          onAddPhotos={onAddPhotos}
          onApplyCrop={onApplyCrop}
          onAssignPhoto={onAssignPhoto}
          onCommitFocalPoint={onCommitFocalPoint}
          onPreviewAdjustment={onPreviewAdjustment}
          onRemovePhoto={onRemovePhoto}
          onRetryAssets={onRetryAssets}
          onSwapPhoto={onSwapPhoto}
        />
      ) : selectedTextBlock && selectedTextSlot && selectedTextStyle ? (
        <TextPropertiesPanel
          commandError={commandError}
          key={`${selectedTextBlock.id}:${selectedTextBlock.text}`}
          slot={selectedTextSlot}
          style={selectedTextStyle}
          textBlock={selectedTextBlock}
          onApplyText={onApplyText}
        />
      ) : theme ? (
        <>
          {activeSpread && (
            <LayoutPropertiesPanel
              activeSpread={activeSpread}
              commandError={commandError}
              layouts={compatibleLayouts}
              theme={theme}
              onApplyLayout={onApplyLayout}
            />
          )}
          <ThemePropertiesPanel
            separated={Boolean(activeSpread)}
            theme={theme}
          />
        </>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-border bg-paper-50 p-5 text-sm leading-6 text-ink-700">
          Выберите фотографию или текст на книге, чтобы изменить его свойства.
        </div>
      )}
    </aside>
  )
}
