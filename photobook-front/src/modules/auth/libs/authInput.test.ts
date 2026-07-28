import { describe, expect, it } from 'vitest'

import { formatKyrgyzPhone } from './formatKyrgyzPhone'
import { getSafeReturnTo } from './getSafeReturnTo'
import { normalizeKyrgyzPhone } from './normalizeKyrgyzPhone'

describe('auth input boundaries', () => {
  it.each([
    ['+996 555 123 456', '+996555123456'],
    ['0555 123 456', '+996555123456'],
    ['555123456', '+996555123456'],
  ])('normalizes a Kyrgyz phone %s', (input, expected) => {
    expect(normalizeKyrgyzPhone(input)).toBe(expected)
  })

  it('rejects incomplete phone input', () => {
    expect(normalizeKyrgyzPhone('0555 12')).toBeNull()
  })

  it('formats a normalized Kyrgyzstan phone for display', () => {
    expect(formatKyrgyzPhone('+996555123456')).toBe('+996 555 123 456')
  })

  it.each([
    ['https://example.com', '/account'],
    ['//example.com', '/account'],
    ['/\\example.com', '/account'],
    ['/login?returnTo=/create', '/account'],
    ['/login/verify', '/account'],
    ['/create?step=photos', '/create?step=photos'],
  ])('resolves returnTo %s safely', (input, expected) => {
    expect(getSafeReturnTo(input)).toBe(expected)
  })
})
