import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { describe, expect, it } from 'vitest'

const schema = JSON.parse(
  readFileSync(
    resolve('docs/api/schemas/analytics-event-v1.schema.json'),
    'utf8',
  ),
) as object
const example = JSON.parse(
  readFileSync(
    resolve('docs/api/examples/analytics/preview-opened.json'),
    'utf8',
  ),
) as object

describe('funnel analytics event contract', () => {
  it('accepts the shared example and rejects arbitrary PII properties', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true })
    addFormats(ajv)
    const validate = ajv.compile(schema)

    expect(validate(example), ajv.errorsText(validate.errors)).toBe(true)
    expect(
      validate({
        ...example,
        properties: { phone: '+996555123456' },
      }),
    ).toBe(false)
  })
})
