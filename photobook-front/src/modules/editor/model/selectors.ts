import type { EditorState } from './editorState'

export interface EditorStoreState {
  readonly editor: EditorState
}

export const selectEditorState = (state: EditorStoreState) => state.editor
