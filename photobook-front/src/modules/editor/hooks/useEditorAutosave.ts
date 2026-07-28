import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import type { BookConfigurationBundle } from '@core/book'
import { getEditorSaveFailure } from '@editor/libs'
import {
  clearEditorDraft,
  editorActions,
  persistEditorDraft,
  type EditorState,
} from '@editor/model'
import { useSaveProjectDocumentMutation } from '@modules/project'
import { getCsrfToken } from '@shared/api'
import { useOnlineStatus } from '@shared/hooks'

export const useEditorAutosave = (
  editor: EditorState,
  configuration: BookConfigurationBundle | undefined,
) => {
  const dispatch = useDispatch()
  const isOnline = useOnlineStatus()
  const [saveProjectDocument] = useSaveProjectDocumentMutation()

  useEffect(() => {
    dispatch(editorActions.connectionChanged(isOnline))
  }, [dispatch, editor.saveStatus, isOnline])

  useEffect(() => {
    if (!editor.projectId || !editor.history || !configuration) return

    if (editor.saveStatus === 'saved') {
      clearEditorDraft(window.localStorage, editor.projectId)
      return
    }

    if (
      editor.saveStatus === 'dirty' ||
      editor.saveStatus === 'offline' ||
      editor.saveStatus === 'error' ||
      editor.saveStatus === 'conflict' ||
      editor.saveStatus === 'session_expired'
    ) {
      persistEditorDraft(
        window.localStorage,
        {
          projectId: editor.projectId,
          baseRevisionId: editor.baseRevisionId ?? '',
          document: editor.history.present,
          pendingCommands: editor.pendingCommands,
          updatedAt: new Date().toISOString(),
        },
        configuration,
      )
    }
  }, [
    configuration,
    editor.baseRevisionId,
    editor.history,
    editor.pendingCommands,
    editor.projectId,
    editor.saveStatus,
  ])

  useEffect(() => {
    if (
      editor.saveStatus !== 'dirty' ||
      editor.activeSave ||
      !isOnline ||
      !editor.projectId ||
      !editor.baseRevisionId ||
      !editor.history
    ) {
      return
    }

    const currentProjectId = editor.projectId
    const currentBaseRevisionId = editor.baseRevisionId
    const currentHistory = editor.history

    const timeoutId = window.setTimeout(() => {
      const csrfToken = getCsrfToken()
      const clientMutationId = crypto.randomUUID()

      dispatch(
        editorActions.saveStarted({
          clientMutationId,
          changeVersion: editor.changeVersion,
          historyDepth: currentHistory.past.length,
          pendingCommandCount: editor.pendingCommands.length,
        }),
      )

      if (!csrfToken) {
        dispatch(
          editorActions.saveFailed({
            clientMutationId,
            kind: 'session_expired',
            message:
              'Сессия закончилась. Войдите снова — изменения останутся на устройстве.',
          }),
        )
        return
      }

      void saveProjectDocument({
        projectId: currentProjectId,
        csrfToken,
        body: {
          baseRevisionId: currentBaseRevisionId,
          clientMutationId,
          document: currentHistory.present,
        },
      })
        .unwrap()
        .then((result) => {
          dispatch(
            editorActions.saveSucceeded({
              clientMutationId,
              revisionId: result.revisionId,
              savedAt: result.savedAt,
            }),
          )
        })
        .catch((error: unknown) => {
          dispatch(
            editorActions.saveFailed({
              clientMutationId,
              ...getEditorSaveFailure(error),
            }),
          )
        })
    }, 650)

    return () => window.clearTimeout(timeoutId)
  }, [
    dispatch,
    editor.activeSave,
    editor.baseRevisionId,
    editor.changeVersion,
    editor.history,
    editor.pendingCommands.length,
    editor.projectId,
    editor.saveStatus,
    isOnline,
    saveProjectDocument,
  ])
}
