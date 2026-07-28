export interface AuthChallengeRequest {
  readonly channel: 'phone'
  readonly contact: string
  readonly locale: 'ky' | 'ru'
}

export interface VerifyAuthChallengeRequest {
  readonly code: string
}

export interface AuthenticatedUser {
  readonly email: string | null
  readonly id: string
  readonly locale: string
  readonly name: string | null
  readonly phone: string
  readonly profileCompleted: boolean
}

export interface AuthenticatedSession {
  readonly csrfToken: string
  readonly sessionId: string
  readonly user: AuthenticatedUser
}
