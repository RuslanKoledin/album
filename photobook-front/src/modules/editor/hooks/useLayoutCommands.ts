import { useDispatch } from 'react-redux'

import {
  createSetSpreadLayoutCommand,
  getCompatibleSpreadLayouts,
  type BookConfigurationBundle,
  type BookDocumentV1,
} from '@core/book'

import type { PhotoAdjustmentPreview } from '@editor/libs'
import { editorActions } from '@editor/model'

interface UseLayoutCommandsInput {
  readonly activeSurfaceId: string
  readonly configuration: BookConfigurationBundle | undefined
  readonly document: BookDocumentV1 | undefined
  readonly setPhotoAdjustmentPreview: (
    preview: PhotoAdjustmentPreview | null,
  ) => void
}

const createLayoutEntityId = (kind: 'photo-slot' | 'text-block') =>
  `${kind}-${crypto.randomUUID()}`

export const useLayoutCommands = ({
  activeSurfaceId,
  configuration,
  document,
  setPhotoAdjustmentPreview,
}: UseLayoutCommandsInput) => {
  const dispatch = useDispatch()
  const activeSpread = document?.spreads.find(
    ({ id }) => id === activeSurfaceId,
  )
  const product = configuration?.productSpecs.find(
    ({ id }) => id === document?.productSelection.productSpecId,
  )
  const theme = configuration?.themeSpecs.find(
    ({ id }) => id === document?.productSelection.themeId,
  )
  const compatibleLayouts =
    configuration && product && theme
      ? getCompatibleSpreadLayouts({
          layouts: configuration.layoutSpecs,
          product,
          theme,
        })
      : []

  return {
    activeSpread,
    compatibleLayouts,
    apply: (layoutId: string) => {
      if (!activeSpread || !configuration || !theme) return
      if (activeSpread.layoutId === layoutId) return

      const targetLayout = compatibleLayouts.find(({ id }) => id === layoutId)
      if (!targetLayout) return

      const command = createSetSpreadLayoutCommand({
        spread: activeSpread,
        targetLayout,
        theme,
        createId: createLayoutEntityId,
      })
      if (!command) return

      setPhotoAdjustmentPreview(null)
      dispatch(editorActions.commandCommitted({ command, configuration }))
    },
  }
}
