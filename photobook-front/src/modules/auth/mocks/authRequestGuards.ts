import type {
  AuthChallengeRequestDto,
  VerifyAuthChallengeRequestDto,
} from '@auth/model'

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const hasExactKeys = (value: UnknownRecord, keys: readonly string[]) =>
  Object.keys(value).length === keys.length &&
  keys.every((key) => Object.hasOwn(value, key))

export const isAuthChallengeRequest = (
  value: unknown,
): value is AuthChallengeRequestDto =>
  isRecord(value) &&
  hasExactKeys(value, ['channel', 'contact', 'locale']) &&
  value.channel === 'phone' &&
  typeof value.contact === 'string' &&
  /^\+996[0-9]{9}$/.test(value.contact) &&
  (value.locale === 'ru' || value.locale === 'ky')

export const isVerifyAuthChallengeRequest = (
  value: unknown,
): value is VerifyAuthChallengeRequestDto =>
  isRecord(value) &&
  hasExactKeys(value, ['code']) &&
  typeof value.code === 'string' &&
  /^[0-9]{6}$/.test(value.code)
