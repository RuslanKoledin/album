import { canRedoBookHistory, canUndoBookHistory } from '@core/book'

import { LocalPreflightSummary } from '@modules/preflight'

import { EditorCanvas } from '@editor-ui/EditorCanvas'
import { EditorToolbar } from '@editor-ui/EditorToolbar'
import { MobileEditorToolbar } from '@editor-ui/MobileEditorToolbar'
import { PagesRail } from '@editor-ui/PagesRail'
import { PropertiesPanel } from '@editor-ui/PropertiesPanel'
import { useEditorScreen } from '@editor/hooks'
import { CenteredMessagePage } from '@shared/ui'

import { EditorLoadingState } from './EditorLoadingState'

interface EditorScreenProps {
  readonly projectId: string
}

const getSurfaceLabel = (surfaceId: string, spreadIndex: number) =>
  surfaceId === 'cover'
    ? 'Обложка'
    : `Разворот ${spreadIndex * 2 + 2}–${spreadIndex * 2 + 3}`

export function EditorScreen({ projectId }: EditorScreenProps) {
  const screen = useEditorScreen(projectId)
  const { catalogQuery, catalogVersion, projectQuery } = screen.queries

  if (projectQuery.isLoading || catalogQuery.isLoading) {
    return <EditorLoadingState />
  }

  if (
    projectQuery.isError ||
    catalogQuery.isError ||
    !screen.document ||
    !screen.selection.activeSurface
  ) {
    return (
      <CenteredMessagePage
        description="Не удалось загрузить проект и его настройки. Проверьте подключение и попробуйте ещё раз."
        eyebrow="Редактор"
        title="Книга пока не открылась"
      >
        <button
          className="mt-8 min-h-11 rounded-full bg-ink-950 px-5 text-sm font-semibold text-surface"
          type="button"
          onClick={() => {
            void projectQuery.refetch()
            if (catalogVersion) void catalogQuery.refetch()
          }}
        >
          Повторить
        </button>
      </CenteredMessagePage>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-paper-100">
      <EditorToolbar
        canRedo={
          screen.editor.history
            ? canRedoBookHistory(screen.editor.history)
            : false
        }
        canUndo={
          screen.editor.history
            ? canUndoBookHistory(screen.editor.history)
            : false
        }
        projectTitle={screen.document.metadata.title}
        projectId={projectId}
        saveStatus={screen.editor.saveStatus}
        onRedo={screen.redo}
        onRetrySave={screen.recoverSave}
        onTitleChange={screen.commands.setBookTitle}
        onUndo={screen.undo}
      />
      {screen.preflight.report && (
        <LocalPreflightSummary
          report={screen.preflight.report}
          onSelectIssue={screen.preflight.selectIssue}
        />
      )}
      <div className="grid min-h-0 min-w-0 flex-1 grid-rows-[minmax(24rem,1fr)_auto] md:grid-cols-[9.25rem_minmax(0,1fr)] md:grid-rows-[minmax(34rem,1fr)_auto] lg:grid-cols-[13.75rem_minmax(0,1fr)_19.625rem] lg:grid-rows-1">
        <PagesRail
          activeSurfaceId={screen.editor.activeSurfaceId}
          canAddSpread={screen.spreadCommands.canAdd}
          canDuplicateSpread={screen.spreadCommands.canDuplicate}
          canMoveSpreadAfter={screen.spreadCommands.canMoveAfter}
          canMoveSpreadBefore={screen.spreadCommands.canMoveBefore}
          canRemoveSpread={screen.spreadCommands.canRemove}
          document={screen.document}
          isAtMaximumSpreadCount={screen.spreadCommands.isAtMaximum}
          isAtMinimumSpreadCount={screen.spreadCommands.isAtMinimum}
          mobileVisible={screen.mobileTool === 'pages'}
          photoSources={screen.photoSources}
          theme={screen.theme}
          warningSurfaceIds={screen.preflight.surfaceIds}
          onAddSpread={screen.spreadCommands.add}
          onDuplicateSpread={screen.spreadCommands.duplicate}
          onMoveSpreadAfter={screen.spreadCommands.moveAfter}
          onMoveSpreadBefore={screen.spreadCommands.moveBefore}
          onRemoveSpread={screen.spreadCommands.remove}
          onSelectSurface={screen.selectSurface}
        />
        <EditorCanvas
          activeSurfaceLabel={getSurfaceLabel(
            screen.editor.activeSurfaceId,
            screen.selection.activeSpreadIndex,
          )}
          mobilePropertiesOpen={screen.mobileTool !== 'pages'}
          photoAdjustmentPreview={screen.photoAdjustmentPreview}
          photoSources={screen.photoSources}
          saveError={screen.editor.saveError}
          saveStatus={screen.editor.saveStatus}
          selectedElementId={screen.editor.selectedElementId}
          surface={screen.selection.activeSurface}
          theme={screen.theme}
          onRetrySave={screen.recoverSave}
          onSelectElement={screen.selectElement}
        />
        <PropertiesPanel
          activeSpread={screen.layoutCommands.activeSpread}
          adjustmentPreview={screen.photoAdjustmentPreview}
          assetDetails={screen.assets}
          assetsError={screen.queries.assetQuery.isError}
          assetsLoading={screen.queries.assetQuery.isLoading}
          commandError={screen.editor.commandError}
          compatibleLayouts={screen.layoutCommands.compatibleLayouts}
          document={screen.document}
          mobileTool={screen.mobileTool}
          mobileVisible={screen.mobileTool !== 'pages'}
          selectedPhotoSlot={screen.selection.selectedPhotoSlot}
          selectedTextBlock={screen.selection.selectedTextBlock}
          selectedTextSlot={screen.selectedTextSlot}
          selectedTextStyle={screen.selectedTextStyle}
          onCloseMobile={screen.closeMobileProperties}
          onApplyCrop={screen.commands.applyCrop}
          onApplyLayout={screen.layoutCommands.apply}
          onApplyText={screen.commands.applyText}
          onAssignPhoto={screen.commands.assignPhoto}
          onCommitFocalPoint={screen.commands.commitFocalPoint}
          onPreviewAdjustment={screen.setPhotoAdjustmentPreview}
          onRemovePhoto={screen.commands.removePhoto}
          onSwapPhoto={screen.commands.swapPhoto}
          onRetryAssets={() => void screen.queries.assetQuery.refetch()}
          theme={screen.theme}
        />
        <MobileEditorToolbar
          activeTool={screen.mobileTool}
          availability={screen.mobileToolAvailability}
          onSelectTool={screen.selectMobileTool}
        />
      </div>
    </div>
  )
}
