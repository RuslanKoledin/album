import { describe, expect, it } from 'vitest'

import { applyBookCommand, createSetSpreadLayoutCommand } from './index'
import {
  createMinimalBookDocumentV1Fixture,
  createMockBookConfigurationBundle,
} from '@mocks/book'

const createSequentialId = () => {
  let index = 0
  return (kind: 'photo-slot' | 'text-block') => `${kind}-${++index}`
}

describe('createSetSpreadLayoutCommand', () => {
  it('preserves photo presentation and builds valid target slots', () => {
    const document = createMinimalBookDocumentV1Fixture()
    const configuration = createMockBookConfigurationBundle()
    const spread = document.spreads[0]
    const targetLayout = configuration.layoutSpecs.find(
      ({ id }) => id === 'mock-spread-layout-photo-caption-v0',
    )
    const theme = configuration.themeSpecs[0]

    expect(spread).toBeDefined()
    expect(targetLayout).toBeDefined()
    expect(theme).toBeDefined()
    if (!spread || !targetLayout || !theme) return

    const command = createSetSpreadLayoutCommand({
      spread,
      targetLayout,
      theme,
      createId: createSequentialId(),
    })

    expect(command).not.toBeNull()
    if (!command) return

    expect(command.photoSlots[0]).toMatchObject({
      id: spread.photoSlots[0]?.id,
      assetId: spread.photoSlots[0]?.assetId,
      crop: spread.photoSlots[0]?.crop,
      focalPoint: spread.photoSlots[0]?.focalPoint,
      layoutSlotKey: 'main-photo',
    })
    expect(command.textBlocks[0]).toMatchObject({
      id: 'text-block-1',
      layoutSlotKey: 'caption',
      role: 'caption',
      text: '',
      textStyleId: 'mock-caption-style-v0',
    })

    const result = applyBookCommand(document, command, configuration)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.document.spreads[0]?.layoutId).toBe(targetLayout.id)
  })

  it('rejects a cover layout before creating an invalid spread command', () => {
    const document = createMinimalBookDocumentV1Fixture()
    const configuration = createMockBookConfigurationBundle()
    const spread = document.spreads[0]
    const coverLayout = configuration.layoutSpecs.find(
      ({ surface }) => surface === 'cover',
    )
    const theme = configuration.themeSpecs[0]

    expect(spread).toBeDefined()
    expect(coverLayout).toBeDefined()
    expect(theme).toBeDefined()
    if (!spread || !coverLayout || !theme) return

    expect(
      createSetSpreadLayoutCommand({
        spread,
        targetLayout: coverLayout,
        theme,
        createId: createSequentialId(),
      }),
    ).toBeNull()
  })
})
