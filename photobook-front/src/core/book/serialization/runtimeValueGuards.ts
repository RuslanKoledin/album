export type UnknownRecord = Record<string, unknown>

export const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const hasExactKeys = (value: UnknownRecord, keys: readonly string[]) => {
  const actualKeys = Object.keys(value)

  return (
    actualKeys.length === keys.length &&
    keys.every((key) => Object.hasOwn(value, key))
  )
}

export const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

export const isOpaqueId = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0
