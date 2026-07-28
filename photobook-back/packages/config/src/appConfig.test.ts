import { describe, expect, it } from 'vitest'

import { loadAppConfig } from './appConfig.js'

describe('loadAppConfig', () => {
  it('provides safe local defaults', () => {
    const config = loadAppConfig({})

    expect(config.environment).toBe('local')
    expect(config.apiPort).toBe(4000)
    expect(config.database.url).toContain('localhost:5432')
    expect(config.corsOrigins).toEqual(['http://localhost:5173'])
  })

  it('rejects missing production infrastructure configuration', () => {
    expect(() => loadAppConfig({ APP_ENV: 'production' })).toThrow(
      'CORS_ORIGINS is required',
    )
  })

  it('rejects credentialed wildcard CORS', () => {
    expect(() => loadAppConfig({ CORS_ORIGINS: '*' })).toThrow(
      'CORS_ORIGINS cannot contain a wildcard',
    )
  })
})
