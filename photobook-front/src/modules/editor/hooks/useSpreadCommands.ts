import { useDispatch } from 'react-redux'

import type {
  BookCommand,
  BookConfigurationBundle,
  BookDocumentV1,
} from '@core/book'

import { createSpreadDraft, type PhotoAdjustmentPreview } from '@editor/libs'
import { editorActions } from '@editor/model'
import { createClientId } from '@shared/lib'

interface UseSpreadCommandsInput {
  readonly activeSurfaceId: string
  readonly configuration: BookConfigurationBundle | undefined
  readonly document: BookDocumentV1 | undefined
  readonly setPhotoAdjustmentPreview: (
    preview: PhotoAdjustmentPreview | null,
  ) => void
}

const createEditorEntityId = (kind: 'spread' | 'photo-slot' | 'text-block') =>
  createClientId(kind)

export const useSpreadCommands = ({
  activeSurfaceId,
  configuration,
  document,
  setPhotoAdjustmentPreview,
}: UseSpreadCommandsInput) => {
  const dispatch = useDispatch()
  const activeSpreadIndex =
    document?.spreads.findIndex(({ id }) => id === activeSurfaceId) ?? -1
  const activeSpread = document?.spreads[activeSpreadIndex]
  const product = configuration?.productSpecs.find(
    ({ id }) => id === document?.productSelection.productSpecId,
  )
  const spreadCount = document?.spreads.length ?? 0
  const canAdd = Boolean(product && spreadCount < product.spreadCount.max)
  const canRemove = Boolean(
    activeSpread && product && spreadCount > product.spreadCount.min,
  )

  const commit = (command: BookCommand) => {
    if (!configuration) return false
    setPhotoAdjustmentPreview(null)
    dispatch(editorActions.commandCommitted({ command, configuration }))
    return true
  }

  const selectSurface = (surfaceId: string) => {
    setPhotoAdjustmentPreview(null)
    dispatch(editorActions.surfaceSelected(surfaceId))
  }

  return {
    canAdd,
    canDuplicate: Boolean(activeSpread && canAdd),
    canMoveAfter: Boolean(activeSpread && activeSpreadIndex < spreadCount - 1),
    canMoveBefore: Boolean(activeSpread && activeSpreadIndex > 0),
    canRemove,
    hasActiveSpread: Boolean(activeSpread),
    isAtMaximum: Boolean(product && spreadCount >= product.spreadCount.max),
    isAtMinimum: Boolean(product && spreadCount <= product.spreadCount.min),
    add: () => {
      const source = activeSpread ?? document?.spreads.at(-1)
      if (!document || !source || !canAdd) return

      const spread = createSpreadDraft({
        source,
        copyContent: false,
        createId: createEditorEntityId,
      })

      if (commit({ type: 'add_spread', spread })) selectSurface(spread.id)
    },
    duplicate: () => {
      if (!activeSpread || !canAdd) return

      const spread = createSpreadDraft({
        source: activeSpread,
        copyContent: true,
        createId: createEditorEntityId,
      })

      if (
        commit({
          type: 'add_spread',
          spread,
          index: activeSpreadIndex + 1,
        })
      ) {
        selectSurface(spread.id)
      }
    },
    moveAfter: () => {
      if (!activeSpread || activeSpreadIndex >= spreadCount - 1) return
      commit({
        type: 'reorder_spread',
        spreadId: activeSpread.id,
        toIndex: activeSpreadIndex + 1,
      })
    },
    moveBefore: () => {
      if (!activeSpread || activeSpreadIndex <= 0) return
      commit({
        type: 'reorder_spread',
        spreadId: activeSpread.id,
        toIndex: activeSpreadIndex - 1,
      })
    },
    remove: () => {
      if (!document || !activeSpread || !canRemove) return

      const nextSurfaceId =
        document.spreads[activeSpreadIndex + 1]?.id ??
        document.spreads[activeSpreadIndex - 1]?.id ??
        'cover'

      if (commit({ type: 'remove_spread', spreadId: activeSpread.id })) {
        selectSurface(nextSurfaceId)
      }
    },
  }
}
