import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'

import {
  createPhotoPixelSizeResolver,
  createPhotoSourceMap,
  getEditorSelection,
  type PhotoAdjustmentPreview,
} from '@editor/libs'
import {
  editorActions,
  selectEditorState,
  type MobileEditorTool,
  type MobileEditorToolAvailability,
} from '@editor/model'
import { useGetAuthSessionQuery } from '@modules/auth'
import {
  useLocalPhotoSelection,
  useProjectPhotoUpload,
} from '@modules/photo-upload'

import { useEditorAutosave } from './useEditorAutosave'
import { useEditorCommands } from './useEditorCommands'
import { useEditorProjectBootstrap } from './useEditorProjectBootstrap'
import { useEditorPreflight } from './useEditorPreflight'
import { useLayoutCommands } from './useLayoutCommands'
import { useSpreadCommands } from './useSpreadCommands'

export const useEditorScreen = (projectId: string) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const editor = useSelector(selectEditorState)
  const [photoAdjustmentPreview, setPhotoAdjustmentPreview] =
    useState<PhotoAdjustmentPreview | null>(null)
  const [photoUploadDialogOpen, setPhotoUploadDialogOpen] = useState(false)
  const [photoUploadFailure, setPhotoUploadFailure] = useState<string | null>(
    null,
  )
  const [mobileTool, setMobileTool] = useState<MobileEditorTool>('pages')
  const sessionQuery = useGetAuthSessionQuery()
  const localPhotos = useLocalPhotoSelection()
  const csrfToken = sessionQuery.data?.authenticated
    ? sessionQuery.data.csrfToken
    : null
  const upload = useProjectPhotoUpload({
    csrfToken,
    getFile: localPhotos.getFile,
  })
  const queries = useEditorProjectBootstrap(projectId, editor.projectId)

  useEditorAutosave(editor, queries.catalogQuery.data)
  useEffect(() => {
    if (
      editor.saveStatus === 'session_expired' &&
      sessionQuery.data?.authenticated
    ) {
      dispatch(editorActions.retrySaveRequested())
    }
  }, [dispatch, editor.saveStatus, sessionQuery.data])

  const document = editor.history?.present
  const configuration = queries.catalogQuery.data
  const assets = queries.assetQuery.data?.items ?? []
  const photoSources = createPhotoSourceMap(assets)
  const selection = getEditorSelection(
    document,
    editor.activeSurfaceId,
    editor.selectedElementId,
    editor.selectedElementKind,
  )
  const theme = configuration?.themeSpecs.find(
    ({ id }) => id === document?.productSelection.themeId,
  )
  const activeLayout = configuration?.layoutSpecs.find(
    ({ id }) => id === selection.activeSurface?.layoutId,
  )
  const selectedTextSlot = activeLayout?.textSlots.find(
    ({ slotKey }) => slotKey === selection.selectedTextBlock?.layoutSlotKey,
  )
  const selectedTextStyle = theme?.textStyles.find(
    ({ id }) => id === selection.selectedTextBlock?.textStyleId,
  )
  const mobileToolAvailability: MobileEditorToolAvailability = {
    pages: true,
    photo: Boolean(selection.activeSurface?.photoSlots.length),
    layout: selection.activeSpreadIndex >= 0,
    text: Boolean(selection.activeSurface?.textBlocks.length),
  }
  const preflight = useEditorPreflight({
    configuration,
    document,
    resolvePhotoPixelSize: createPhotoPixelSizeResolver(assets),
    onClearPhotoAdjustmentPreview: () => setPhotoAdjustmentPreview(null),
    onSelectMobileTool: setMobileTool,
  })
  const commands = useEditorCommands({
    configuration,
    document,
    selectedPhotoSlot: selection.selectedPhotoSlot,
    selectedTextBlock: selection.selectedTextBlock,
    setPhotoAdjustmentPreview,
  })
  const confirmPhotoUpload = async () => {
    setPhotoUploadFailure(null)
    if (!editor.projectId) {
      setPhotoUploadFailure('Проект ещё загружается. Повторите через секунду.')
      return
    }
    if (!csrfToken) {
      setPhotoUploadFailure(
        'Сессия закончилась. Войдите снова, чтобы добавить фотографии.',
      )
      return
    }

    const result = await upload.start({
      projectId: editor.projectId,
      photos: localPhotos.photos,
    })
    if (result.kind !== 'ready') {
      setPhotoUploadFailure(
        'Не удалось загрузить все фотографии. Проверьте файлы и попробуйте ещё раз.',
      )
      return
    }

    commands.addAssetsAndFillEmptySlots(result.assetIds)
    localPhotos.clear()
    upload.reset()
    setPhotoUploadDialogOpen(false)
    void queries.assetQuery.refetch()
  }
  const spreadCommands = useSpreadCommands({
    activeSurfaceId: editor.activeSurfaceId,
    configuration,
    document,
    setPhotoAdjustmentPreview,
  })
  const layoutCommands = useLayoutCommands({
    activeSurfaceId: editor.activeSurfaceId,
    configuration,
    document,
    setPhotoAdjustmentPreview,
  })
  return {
    commands,
    document,
    editor,
    layoutCommands,
    mobileTool,
    mobileToolAvailability,
    assets,
    photoSources,
    photoAdjustmentPreview,
    photoUpload: {
      error: photoUploadFailure,
      isOpen: photoUploadDialogOpen,
      isUploading: upload.isBusy,
      issues: localPhotos.issues,
      photos: localPhotos.photos,
      uploadItems: upload.items,
      uploadReadyCount: upload.readyCount,
      addFiles: (files: readonly File[]) => {
        setPhotoUploadFailure(null)
        localPhotos.addFiles(files)
      },
      clear: () => {
        setPhotoUploadFailure(null)
        localPhotos.clear()
        upload.reset()
      },
      close: () => {
        if (upload.isBusy) return
        setPhotoUploadDialogOpen(false)
      },
      confirm: () => void confirmPhotoUpload(),
      dismissIssues: localPhotos.clearIssues,
      open: () => {
        setPhotoUploadFailure(null)
        setPhotoUploadDialogOpen(true)
      },
      removePhoto: localPhotos.removePhoto,
    },
    preflight,
    queries,
    selection,
    selectedTextSlot,
    selectedTextStyle,
    setPhotoAdjustmentPreview,
    spreadCommands,
    theme,
    redo: () => dispatch(editorActions.redoRequested()),
    recoverSave: () => {
      if (editor.saveStatus !== 'session_expired') {
        dispatch(editorActions.retrySaveRequested())
        return
      }

      void sessionQuery.refetch().finally(() => {
        const returnTo = `/projects/${encodeURIComponent(projectId)}/editor`
        void navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`)
      })
    },
    closeMobileProperties: () => setMobileTool('pages'),
    selectMobileTool: (tool: MobileEditorTool) => {
      if (!mobileToolAvailability[tool]) return

      setPhotoAdjustmentPreview(null)
      setMobileTool(tool)

      if (tool === 'layout') {
        dispatch(editorActions.surfaceSelected(editor.activeSurfaceId))
      }
      if (tool === 'photo') {
        const photoSlot =
          selection.selectedPhotoSlot ?? selection.activeSurface?.photoSlots[0]
        if (photoSlot) {
          dispatch(
            editorActions.elementSelected({ id: photoSlot.id, kind: 'photo' }),
          )
        }
      }
      if (tool === 'text') {
        const textBlock =
          selection.selectedTextBlock ?? selection.activeSurface?.textBlocks[0]
        if (textBlock) {
          dispatch(
            editorActions.elementSelected({ id: textBlock.id, kind: 'text' }),
          )
        }
      }
    },
    selectElement: (id: string, kind: 'photo' | 'text') => {
      setPhotoAdjustmentPreview(null)
      setMobileTool(kind)
      dispatch(editorActions.elementSelected({ id, kind }))
    },
    selectSurface: (surfaceId: string) => {
      setPhotoAdjustmentPreview(null)
      setMobileTool('pages')
      dispatch(editorActions.surfaceSelected(surfaceId))
    },
    undo: () => dispatch(editorActions.undoRequested()),
  }
}
