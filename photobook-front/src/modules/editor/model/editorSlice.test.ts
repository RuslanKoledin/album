import { describe, expect, it } from 'vitest'

import {
  createMinimalBookDocumentV1Fixture,
  createMockBookConfigurationBundle,
} from '@mocks/book'

import { editorActions, editorReducer } from './editorSlice'
import { initialEditorState } from './editorState'

const hydrateEditor = () =>
  editorReducer(
    initialEditorState,
    editorActions.projectLoaded({
      projectId: 'demo-project',
      revisionId: 'revision-1',
      title: 'Семейная история',
      document: createMinimalBookDocumentV1Fixture(),
    }),
  )

describe('editorSlice', () => {
  it('hydrates a project without copying RTK Query DTO state', () => {
    const state = hydrateEditor()

    expect(state.projectId).toBe('demo-project')
    expect(state.history?.present.metadata.title).toBe('Семейная история')
    expect(state.saveStatus).toBe('saved')
  })

  it('commits a core command and supports undo and redo', () => {
    const configuration = createMockBookConfigurationBundle()
    const loaded = hydrateEditor()

    const changed = editorReducer(
      loaded,
      editorActions.commandCommitted({
        command: {
          type: 'set_text',
          textBlockId: 'mock-cover-text-block-01',
          text: 'Наш семейный год',
        },
        configuration,
      }),
    )

    expect(changed.history?.present.cover.textBlocks[0]?.text).toBe(
      'Наш семейный год',
    )
    expect(changed.saveStatus).toBe('dirty')
    expect(changed.pendingCommands).toHaveLength(1)

    const undone = editorReducer(changed, editorActions.undoRequested())
    expect(undone.history?.present.cover.textBlocks[0]?.text).toBe(
      'Семейная история',
    )
    expect(undone.pendingCommands).toHaveLength(0)

    const redone = editorReducer(undone, editorActions.redoRequested())
    expect(redone.history?.present.cover.textBlocks[0]?.text).toBe(
      'Наш семейный год',
    )
    expect(redone.pendingCommands).toHaveLength(1)
  })

  it('keeps the current document when a command is invalid', () => {
    const loaded = hydrateEditor()

    const result = editorReducer(
      loaded,
      editorActions.commandCommitted({
        command: {
          type: 'set_text',
          textBlockId: 'missing-text-block',
          text: 'Новый текст',
        },
        configuration: createMockBookConfigurationBundle(),
      }),
    )

    expect(result.history).toBe(loaded.history)
    expect(result.commandError).toBe(
      'Не удалось применить изменение к выбранному элементу.',
    )
  })

  it('commits crop and focal point as one undoable history entry', () => {
    const loaded = hydrateEditor()
    const configuration = createMockBookConfigurationBundle()

    const changed = editorReducer(
      loaded,
      editorActions.commandBatchCommitted({
        commands: [
          {
            type: 'set_photo_crop',
            photoSlotId: 'mock-cover-photo-slot-01',
            crop: { x: 0.25, y: 0.1, width: 0.5, height: 0.5 },
          },
          {
            type: 'set_photo_focal_point',
            photoSlotId: 'mock-cover-photo-slot-01',
            focalPoint: { x: 0.7, y: 0.35 },
          },
        ],
        configuration,
      }),
    )

    expect(changed.history?.past).toHaveLength(1)
    expect(changed.pendingCommands).toHaveLength(2)
    expect(changed.history?.present.cover.photoSlots[0]?.focalPoint).toEqual({
      x: 0.7,
      y: 0.35,
    })

    const undone = editorReducer(changed, editorActions.undoRequested())
    expect(undone.history?.present.cover.photoSlots[0]?.focalPoint).toEqual({
      x: 0.5,
      y: 0.5,
    })
  })

  it('keeps a valid active spread when undo removes the selected addition', () => {
    const loaded = hydrateEditor()
    const source = loaded.history?.present.spreads[0]
    expect(source).toBeDefined()
    if (!source) return

    const addedSpread = {
      ...source,
      id: 'added-spread',
      photoSlots: source.photoSlots.map((slot, index) => ({
        ...slot,
        id: `added-photo-slot-${index}`,
        assetId: null,
      })),
      textBlocks: source.textBlocks.map((textBlock, index) => ({
        ...textBlock,
        id: `added-text-block-${index}`,
        text: '',
      })),
    }
    const added = editorReducer(
      loaded,
      editorActions.commandCommitted({
        command: { type: 'add_spread', spread: addedSpread },
        configuration: createMockBookConfigurationBundle(),
      }),
    )
    const selected = editorReducer(
      added,
      editorActions.surfaceSelected(addedSpread.id),
    )
    const undone = editorReducer(selected, editorActions.undoRequested())

    expect(undone.activeSurfaceId).toBe('mock-spread-01')
    expect(undone.history?.present.spreads).toHaveLength(1)
  })

  it('updates the base revision only after a successful save', () => {
    const loaded = hydrateEditor()
    const saving = editorReducer(
      loaded,
      editorActions.saveStarted({ clientMutationId: 'mutation-1' }),
    )
    const saved = editorReducer(
      saving,
      editorActions.saveSucceeded({
        revisionId: 'revision-2',
        savedAt: '2026-07-21T12:00:00Z',
        clientMutationId: 'mutation-1',
      }),
    )

    expect(saved.baseRevisionId).toBe('revision-2')
    expect(saved.saveStatus).toBe('saved')
    expect(saved.pendingCommands).toEqual([])
  })
})
