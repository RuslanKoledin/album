import { createHash } from 'node:crypto'

function serializeNumber(value: number) {
  if (!Number.isFinite(value)) {
    throw new TypeError('JSON numbers must be finite')
  }

  return JSON.stringify(Object.is(value, -0) ? 0 : value)
}

function serializeObject(value: object) {
  const prototype = Object.getPrototypeOf(value) as unknown
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError('Only plain JSON objects are supported')
  }

  return `{${Object.keys(value)
    .sort()
    .map((key) => {
      const item = (value as Record<string, unknown>)[key]
      if (item === undefined) {
        throw new TypeError('Undefined object values are not supported')
      }
      return `${JSON.stringify(key)}:${canonicalizeJson(item)}`
    })
    .join(',')}}`
}

export function canonicalizeJson(value: unknown): string {
  if (value === null) return 'null'
  if (typeof value === 'boolean' || typeof value === 'string') {
    return JSON.stringify(value)
  }
  if (typeof value === 'number') return serializeNumber(value)
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalizeJson(item)).join(',')}]`
  }
  if (typeof value === 'object') return serializeObject(value)

  throw new TypeError(`Unsupported JSON value: ${typeof value}`)
}

export function createJsonHash(value: unknown) {
  return createHash('sha256').update(canonicalizeJson(value)).digest('hex')
}
