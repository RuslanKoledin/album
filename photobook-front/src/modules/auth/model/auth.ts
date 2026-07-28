type AuthLocale = 'ru' | 'ky'

export interface AuthUserDto {
  readonly id: string
  readonly name: string | null
  readonly phone: string
  readonly email: string | null
  readonly locale: AuthLocale
  readonly profileCompleted: boolean
}

export interface AuthChallengeRequestDto {
  readonly channel: 'phone'
  readonly contact: string
  readonly locale: AuthLocale
}

export interface AuthChallengeResponseDto {
  readonly challengeId: string
  readonly maskedContact: string
  readonly expiresAt: string
  readonly resendAvailableAt: string
}

export interface VerifyAuthChallengeRequestDto {
  readonly code: string
}

export interface AuthVerificationResponseDto {
  readonly user: AuthUserDto
  readonly csrfToken: string
}

interface AnonymousAuthSessionDto {
  readonly authenticated: false
  readonly user: null
  readonly csrfToken: null
}

interface AuthenticatedAuthSessionDto {
  readonly authenticated: true
  readonly user: AuthUserDto
  readonly csrfToken: string
}

export type AuthSessionResponseDto =
  AnonymousAuthSessionDto | AuthenticatedAuthSessionDto

export interface VerifyAuthChallengeArgs {
  readonly challengeId: string
  readonly body: VerifyAuthChallengeRequestDto
}

export interface LogoutArgs {
  readonly csrfToken: string
}
