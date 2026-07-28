import { describe, expect, it } from 'vitest'

import {
  createMinimalBookDocumentV1Fixture,
  createMockBookConfigurationBundle,
} from '@mocks/book'

import {
  clearEditorDraft,
  readEditorDraft,
  writeEditorDraft,
} from './editorDraftStorage'

describe('editorDraftStorage', () => {
  it('restores a valid unsaved document for the same project', () => {
    const document = createMinimalBookDocumentV1Fixture()
    const storage = window.localStorage

    writeEditorDraft(storage, {
      projectId: 'demo-project',
      baseRevisionId: 'revision-1',
      document,
      pendingCommands: [
        {
          type: 'set_text',
          textBlockId: 'mock-cover-text-block-01',
          text: 'Черновик',
        },
      ],
      updatedAt: '2026-07-21T12:00:00Z',
    })

    const restored = readEditorDraft(
      storage,
      'demo-project',
      createMockBookConfigurationBundle(),
    )

    expect(restored?.document).toEqual(document)
    expect(restored?.pendingCommands).toHaveLength(1)
  })

  it('ignores malformed drafts and can clear a saved draft', () => {
    const storage = window.localStorage
    storage.setItem('photobook.editor.draft.demo-project', '{broken')

    expect(
      readEditorDraft(
        storage,
        'demo-project',
        createMockBookConfigurationBundle(),
      ),
    ).toBeNull()

    clearEditorDraft(storage, 'demo-project')
    expect(storage.getItem('photobook.editor.draft.demo-project')).toBeNull()
  })
})
