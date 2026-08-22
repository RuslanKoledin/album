import { describe, expect, it } from 'vitest'

import { createMinimalBookDocumentV1Fixture } from '@mocks/book'

import { createPhotoUploadPlacementCommands } from './createPhotoUploadPlacementCommands'

describe('createPhotoUploadPlacementCommands', () => {
  it('adds uploaded assets and fills empty photo slots in book order', () => {
    const fixture = createMinimalBookDocumentV1Fixture()
    const coverSlot = fixture.cover.photoSlots[0]
    const spread = fixture.spreads[0]
    const spreadSlot = spread?.photoSlots[0]

    expect(coverSlot).toBeDefined()
    expect(spread).toBeDefined()
    expect(spreadSlot).toBeDefined()

    if (!coverSlot || !spread || !spreadSlot) {
      throw new Error('The fixture has no required photo slots')
    }

    const document = {
      ...fixture,
      cover: {
        ...fixture.cover,
        photoSlots: [{ ...coverSlot, assetId: null }],
      },
      spreads: [
        {
          ...spread,
          photoSlots: [{ ...spreadSlot, assetId: null }],
        },
      ],
    }

    expect(
      createPhotoUploadPlacementCommands(document, [
        'mock-upload-01',
        'mock-upload-01',
        'mock-upload-02',
        'mock-upload-03',
      ]),
    ).toEqual([
      {
        type: 'add_assets',
        assetIds: ['mock-upload-01', 'mock-upload-02', 'mock-upload-03'],
      },
      {
        type: 'assign_photo',
        photoSlotId: coverSlot.id,
        assetId: 'mock-upload-01',
      },
      {
        type: 'assign_photo',
        photoSlotId: spreadSlot.id,
        assetId: 'mock-upload-02',
      },
    ])
  })

  it('leaves uploads in the library when there are no empty slots', () => {
    const document = createMinimalBookDocumentV1Fixture()

    expect(
      createPhotoUploadPlacementCommands(document, ['mock-upload-01']),
    ).toEqual([{ type: 'add_assets', assetIds: ['mock-upload-01'] }])
  })
})
