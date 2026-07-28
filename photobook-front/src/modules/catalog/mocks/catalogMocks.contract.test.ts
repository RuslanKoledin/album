import { describe, expect, it } from 'vitest'

import { createHttpContractValidator } from '@tests/contracts/httpContract'
import { mockCatalogVersionResponse } from './catalogFixtures'

describe('catalog MSW fixtures', () => {
  it('matches the frozen catalog response schema', () => {
    const validate = createHttpContractValidator('catalogVersionResponse')

    expect(
      validate(mockCatalogVersionResponse),
      JSON.stringify(validate.errors),
    ).toBe(true)
  })
})
