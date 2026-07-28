import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { palette } from './palette'

const colorsCss = readFileSync(
  resolve('src/shared/config/styles/colors.css'),
  'utf8',
)

const getRelativeLuminance = (hex: string) => {
  const coefficients = [0.2126, 0.7152, 0.0722]
  const channels = [1, 3, 5].map((start) => {
    const value = Number.parseInt(hex.slice(start, start + 2), 16) / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })

  return channels.reduce(
    (result, channel, index) => result + channel * (coefficients[index] ?? 0),
    0,
  )
}

const getContrastRatio = (first: string, second: string) => {
  const firstLuminance = getRelativeLuminance(first)
  const secondLuminance = getRelativeLuminance(second)
  const lighter = Math.max(firstLuminance, secondLuminance)
  const darker = Math.min(firstLuminance, secondLuminance)

  return (lighter + 0.05) / (darker + 0.05)
}

describe('palette', () => {
  it('keeps TypeScript and CSS color tokens synchronized', () => {
    const cssPalette = Object.fromEntries(
      Array.from(
        colorsCss.matchAll(/--color-([\w-]+):\s*(#[\da-f]+);/gi),
        ([, token, value]) => [token, value?.toUpperCase()],
      ),
    )

    expect(cssPalette).toEqual(palette)
  })

  it.each([
    ['ink-500', 'paper-100'],
    ['accent-600', 'paper-50'],
    ['success', 'success-soft'],
    ['warning', 'warning-soft'],
    ['danger', 'danger-soft'],
    ['info', 'info-soft'],
  ] as const)('keeps %s readable on %s', (foreground, background) => {
    expect(
      getContrastRatio(palette[foreground], palette[background]),
    ).toBeGreaterThanOrEqual(4.5)
  })

  it('keeps interactive boundaries visible on light surfaces', () => {
    expect(
      getContrastRatio(palette['control-border'], palette.surface),
    ).toBeGreaterThanOrEqual(3)
  })
})
