import type {
  AuthChallengeResponseDto,
  AuthSessionResponseDto,
  AuthUserDto,
  AuthVerificationResponseDto,
} from '@auth/model'
import { DEVELOPMENT_AUTH_OTP } from '@auth/model'
import { readMockSessionState, writeMockSessionState } from '@mocks/storage'

export const MOCK_AUTH_CSRF_TOKEN = 'mock-csrf-token'

const MOCK_AUTH_USER: AuthUserDto = {
  id: 'mock-user-01',
  name: null,
  phone: '+996555123456',
  email: null,
  locale: 'ru',
  profileCompleted: false,
}

interface MockAuthChallenge {
  readonly contact: string
  readonly response: AuthChallengeResponseDto
}

type VerifyMockAuthResult =
  | { readonly kind: 'success'; readonly value: AuthVerificationResponseDto }
  | { readonly kind: 'invalid_code' }
  | { readonly kind: 'expired' }

let isAuthenticated = true
let challengeSequence = 0
const challenges = new Map<string, MockAuthChallenge>()

interface AuthMockSnapshot {
  readonly authenticated: boolean
  readonly challengeSequence: number
  readonly challenges: [string, MockAuthChallenge][]
}

const AUTH_MOCK_STORAGE_KEY = 'photobook:mock:auth:v1'

const isAuthMockSnapshot = (value: unknown): value is AuthMockSnapshot => {
  if (!value || typeof value !== 'object') return false
  const snapshot = value as Record<string, unknown>

  return (
    typeof snapshot.authenticated === 'boolean' &&
    typeof snapshot.challengeSequence === 'number' &&
    Array.isArray(snapshot.challenges)
  )
}

const persistAuthMockState = () => {
  writeMockSessionState(AUTH_MOCK_STORAGE_KEY, {
    authenticated: isAuthenticated,
    challengeSequence,
    challenges: [...challenges.entries()],
  } satisfies AuthMockSnapshot)
}

const restoreAuthMockState = () => {
  const snapshot = readMockSessionState(AUTH_MOCK_STORAGE_KEY)
  if (!isAuthMockSnapshot(snapshot)) {
    resetAuthMockState()
    return
  }

  isAuthenticated = snapshot.authenticated
  challengeSequence = snapshot.challengeSequence
  challenges.clear()
  snapshot.challenges.forEach(([key, value]) => challenges.set(key, value))
}

const createChallengeTiming = (contact: string): AuthChallengeResponseDto => {
  challengeSequence += 1
  const now = Date.now()

  return {
    challengeId: `mock-auth-challenge-${challengeSequence}`,
    maskedContact: `${contact.slice(0, 5)} *** ** ${contact.slice(-2)}`,
    expiresAt: new Date(now + 5 * 60_000).toISOString(),
    resendAvailableAt: new Date(now + 60_000).toISOString(),
  }
}

export const createMockAuthChallenge = (
  contact: string,
): AuthChallengeResponseDto => {
  const response = createChallengeTiming(contact)
  challenges.set(response.challengeId, { contact, response })
  persistAuthMockState()
  return response
}

export const verifyMockAuthChallenge = (
  challengeId: string,
  code: string,
): VerifyMockAuthResult => {
  const challenge = challenges.get(challengeId)
  if (!challenge || code === '000000') return { kind: 'expired' }
  if (code !== DEVELOPMENT_AUTH_OTP) return { kind: 'invalid_code' }

  isAuthenticated = true
  challenges.delete(challengeId)
  persistAuthMockState()
  return {
    kind: 'success',
    value: { user: MOCK_AUTH_USER, csrfToken: MOCK_AUTH_CSRF_TOKEN },
  }
}

export const resendMockAuthChallenge = (
  challengeId: string,
): AuthChallengeResponseDto | null => {
  const challenge = challenges.get(challengeId)
  if (!challenge) return null

  const response = createChallengeTiming(challenge.contact)
  challenges.delete(challengeId)
  challenges.set(response.challengeId, {
    contact: challenge.contact,
    response,
  })
  persistAuthMockState()
  return response
}

export const getMockAuthSession = (): AuthSessionResponseDto =>
  isAuthenticated
    ? {
        authenticated: true,
        user: MOCK_AUTH_USER,
        csrfToken: MOCK_AUTH_CSRF_TOKEN,
      }
    : { authenticated: false, user: null, csrfToken: null }

export const hasAuthenticatedMockSession = () => isAuthenticated

export const hasMockOperatorAccess = () =>
  isAuthenticated && MOCK_AUTH_USER.id === 'mock-user-01'

export const logoutMockAuthSession = () => {
  isAuthenticated = false
  persistAuthMockState()
}

export const resetAuthMockState = () => {
  isAuthenticated = true
  challengeSequence = 0
  challenges.clear()
  persistAuthMockState()
}

restoreAuthMockState()
