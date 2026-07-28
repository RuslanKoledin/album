import { describe, expect, it } from 'vitest'

import {
  applyBookCommandBatch,
  BOOK_HISTORY_LIMIT,
  canRedoBookHistory,
  canUndoBookHistory,
  commitBookCommandBatch,
  createBookHistory,
  redoBookHistory,
  undoBookHistory,
  type BookCommand,
  type BookHistory,
  type CommitBookCommandBatchResult,
} from './index'
import {
  createMinimalBookDocumentV1Fixture,
  createMockBookConfigurationBundle,
} from '@mocks/book'

const configuration = createMockBookConfigurationBundle()

const getCommittedHistory = (result: CommitBookCommandBatchResult) => {
  expect(result.ok).toBe(true)

  if (!result.ok) {
    throw new Error(`Book history commit failed: ${result.error.code}`)
  }

  return result.history
}

describe('applyBookCommandBatch', () => {
  it('applies every command in order and returns the final document', () => {
    const initial = createMinimalBookDocumentV1Fixture()
    const photoSlotId = initial.spreads[0]?.photoSlots[0]?.id

    expect(photoSlotId).toBeDefined()

    if (!photoSlotId) {
      throw new Error('The minimal fixture has no spread photo')
    }

    const result = applyBookCommandBatch(
      initial,
      [
        { type: 'set_book_title', title: 'Лето в Кыргызстане' },
        {
          type: 'set_photo_crop',
          photoSlotId,
          crop: { x: 0.1, y: 0, width: 0.8, height: 1 },
        },
      ],
      configuration,
    )

    expect(result).toMatchObject({
      ok: true,
      document: {
        metadata: { title: 'Лето в Кыргызстане' },
        spreads: [
          {
            photoSlots: [{ crop: { x: 0.1, y: 0, width: 0.8, height: 1 } }],
          },
        ],
      },
      issues: [],
    })
    expect(initial.metadata.title).toBe('Семейная история')
  })

  it('rejects the whole batch when one command fails', () => {
    const initial = createMinimalBookDocumentV1Fixture()
    const before = JSON.stringify(initial)

    expect(
      applyBookCommandBatch(
        initial,
        [
          { type: 'set_book_title', title: 'Не должно примениться' },
          {
            type: 'set_cover_option',
            optionId: 'mock-cover-material',
            valueId: 'unknown-value',
          },
        ],
        configuration,
      ),
    ).toMatchObject({
      ok: false,
      error: {
        code: 'command_failed',
        commandIndex: 1,
        commandType: 'set_cover_option',
        cause: { code: 'document_invalid' },
      },
    })
    expect(JSON.stringify(initial)).toBe(before)
  })

  it('rejects an empty batch because it is not a completed operation', () => {
    expect(
      applyBookCommandBatch(
        createMinimalBookDocumentV1Fixture(),
        [],
        configuration,
      ),
    ).toEqual({
      ok: false,
      error: {
        code: 'empty_batch',
        message: 'A book command batch must contain at least one command',
      },
    })
  })

  it('keeps non-blocking draft issues visible after later commands', () => {
    const initial = createMinimalBookDocumentV1Fixture()
    const photoSlotId = initial.spreads[0]?.photoSlots[0]?.id

    expect(photoSlotId).toBeDefined()

    if (!photoSlotId) {
      throw new Error('The minimal fixture has no spread photo')
    }

    expect(
      applyBookCommandBatch(
        initial,
        [
          { type: 'remove_photo', photoSlotId },
          { type: 'set_book_title', title: 'Незавершённый черновик' },
        ],
        configuration,
      ),
    ).toMatchObject({
      ok: true,
      issues: [{ code: 'required_photo_missing' }],
    })
  })
})

describe('BookHistory', () => {
  it('stores one history entry for one successful command batch', () => {
    const initial = createMinimalBookDocumentV1Fixture()
    const history = createBookHistory(initial)
    const commands: readonly BookCommand[] = [
      { type: 'set_book_title', title: 'Одна операция' },
      {
        type: 'set_cover_option',
        optionId: 'mock-cover-material',
        valueId: 'mock-cover-material-linen',
      },
    ]
    const result = commitBookCommandBatch(history, commands, configuration)
    const committed = getCommittedHistory(result)

    expect(committed.present.metadata.title).toBe('Одна операция')
    expect(committed.past).toHaveLength(1)
    expect(committed.past[0]?.commands).toEqual(commands)
    expect(committed.future).toEqual([])
    expect(history.present).toBe(initial)
    expect(history.past).toEqual([])
  })

  it('undoes and redoes the complete batch as one operation', () => {
    const initial = createMinimalBookDocumentV1Fixture()
    const committed = getCommittedHistory(
      commitBookCommandBatch(
        createBookHistory(initial),
        [
          { type: 'set_book_title', title: 'После batch' },
          {
            type: 'set_cover_option',
            optionId: 'mock-cover-material',
            valueId: 'mock-cover-material-linen',
          },
        ],
        configuration,
      ),
    )

    expect(canUndoBookHistory(committed)).toBe(true)
    expect(canRedoBookHistory(committed)).toBe(false)

    const undone = undoBookHistory(committed)

    expect(undone.present).toBe(initial)
    expect(undone.past).toEqual([])
    expect(undone.future).toHaveLength(1)
    expect(canUndoBookHistory(undone)).toBe(false)
    expect(canRedoBookHistory(undone)).toBe(true)

    const redone = redoBookHistory(undone)

    expect(redone.present.metadata.title).toBe('После batch')
    expect(redone.present.productSelection.optionSelections[0]?.valueId).toBe(
      'mock-cover-material-linen',
    )
    expect(redone.past).toHaveLength(1)
    expect(redone.future).toEqual([])
  })

  it('clears redo after a new operation and keeps failed commits atomic', () => {
    const initial = createMinimalBookDocumentV1Fixture()
    const firstCommit = getCommittedHistory(
      commitBookCommandBatch(
        createBookHistory(initial),
        [{ type: 'set_book_title', title: 'Первое изменение' }],
        configuration,
      ),
    )
    const undone = undoBookHistory(firstCommit)
    const secondCommit = getCommittedHistory(
      commitBookCommandBatch(
        undone,
        [{ type: 'set_book_title', title: 'Другая ветка' }],
        configuration,
      ),
    )

    expect(secondCommit.future).toEqual([])

    const failed = commitBookCommandBatch(
      secondCommit,
      [
        {
          type: 'set_theme_option',
          themeId: 'unknown-theme',
        },
      ],
      configuration,
    )

    expect(failed).toMatchObject({
      ok: false,
      error: { code: 'command_failed', commandIndex: 0 },
    })
    expect(secondCommit.present.metadata.title).toBe('Другая ветка')
    expect(secondCommit.past).toHaveLength(1)
  })

  it('returns the same history when undo or redo is unavailable', () => {
    const history = createBookHistory(createMinimalBookDocumentV1Fixture())

    expect(undoBookHistory(history)).toBe(history)
    expect(redoBookHistory(history)).toBe(history)
  })

  it(`keeps only the latest ${BOOK_HISTORY_LIMIT} operations`, () => {
    let history: BookHistory = createBookHistory(
      createMinimalBookDocumentV1Fixture(),
    )

    for (let index = 1; index <= BOOK_HISTORY_LIMIT + 1; index += 1) {
      history = getCommittedHistory(
        commitBookCommandBatch(
          history,
          [{ type: 'set_book_title', title: `Изменение ${index}` }],
          configuration,
        ),
      )
    }

    expect(history.past).toHaveLength(BOOK_HISTORY_LIMIT)

    for (let index = 0; index < BOOK_HISTORY_LIMIT; index += 1) {
      history = undoBookHistory(history)
    }

    expect(history.present.metadata.title).toBe('Изменение 1')
    expect(canUndoBookHistory(history)).toBe(false)
    expect(history.future).toHaveLength(BOOK_HISTORY_LIMIT)
  })
})
