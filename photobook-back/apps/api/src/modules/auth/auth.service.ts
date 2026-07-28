import { randomUUID } from 'node:crypto'
import { Inject, Injectable } from '@nestjs/common'
import type { FastifyReply, FastifyRequest } from 'fastify'

import { APP_CONFIG, type AppConfig } from '@photobook/config'

import { ApiError } from '@api/common/http/api-error.js'
import { ContractValidationService } from '@api/common/http/contract-validation.service.js'
import { DatabaseService } from '@api/modules/database/database.service.js'

import { AuthCryptoService } from './auth-crypto.service.js'
import type {
  AuthChallengeRequest,
  AuthenticatedSession,
  AuthenticatedUser,
} from './auth.types.js'

function addSeconds(date: Date, seconds: number) {
  return new Date(date.getTime() + seconds * 1_000)
}

function mapUser(user: AuthenticatedUser): AuthenticatedUser {
  return {
    email: user.email,
    id: user.id,
    locale: user.locale,
    name: user.name,
    phone: user.phone,
    profileCompleted: user.profileCompleted,
  }
}

function maskPhone(phone: string) {
  const visibleSuffix = phone.slice(-4)
  return `${phone.slice(0, 4)}•••${visibleSuffix}`
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    @Inject(AuthCryptoService) private readonly crypto: AuthCryptoService,
    @Inject(DatabaseService) private readonly database: DatabaseService,
    @Inject(ContractValidationService)
    private readonly validation: ContractValidationService,
  ) {}

  async createChallenge(body: unknown, requester: string) {
    this.validation.assertHttp('authChallengeRequest', body)
    const request = body as AuthChallengeRequest
    const now = new Date()
    const contactHash = this.crypto.hashContact(request.contact)
    const requesterHash = this.crypto.hashRequester(requester)
    const windowStart = addSeconds(
      now,
      -this.config.auth.challengeRateWindowSeconds,
    )
    const recentCount = await this.database.client.authChallenge.count({
      where: {
        createdAt: { gte: windowStart },
        OR: [{ contactHash }, { requesterHash }],
      },
    })
    if (recentCount >= this.config.auth.challengeRateLimit) {
      throw this.rateLimitError(this.config.auth.challengeRateWindowSeconds)
    }

    return this.createChallengeRecord({
      contact: request.contact,
      contactHash,
      locale: request.locale,
      now,
      requesterHash,
    })
  }

  async getSession(request: FastifyRequest) {
    const session = await this.findSession(request)
    if (!session) {
      return { authenticated: false, csrfToken: null, user: null }
    }

    return {
      authenticated: true,
      csrfToken: session.csrfToken,
      user: session.user,
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const session = await this.requireSession(request, true)
    await this.database.client.session.update({
      data: { invalidatedAt: new Date() },
      where: { id: session.sessionId },
    })
    reply.clearCookie(this.config.auth.cookieName, {
      path: '/api/v1',
    })
  }

  async resend(challengeId: string) {
    const challenge = await this.database.client.authChallenge.findUnique({
      where: { id: challengeId },
    })
    const now = new Date()
    if (
      !challenge ||
      challenge.consumedAt ||
      challenge.expiresAt.getTime() <= now.getTime()
    ) {
      throw this.expiredCodeError()
    }
    if (challenge.resendAvailableAt.getTime() > now.getTime()) {
      const seconds = Math.max(
        1,
        Math.ceil(
          (challenge.resendAvailableAt.getTime() - now.getTime()) / 1_000,
        ),
      )
      throw this.rateLimitError(seconds)
    }

    await this.database.client.authChallenge.update({
      data: { consumedAt: now },
      where: { id: challenge.id },
    })
    return this.createChallengeRecord({
      contact: challenge.contact,
      contactHash: challenge.contactHash,
      locale: challenge.locale,
      now,
      requesterHash: challenge.requesterHash,
    })
  }

  async requireSession(request: FastifyRequest, requireCsrf = false) {
    const token = request.cookies[this.config.auth.cookieName]
    const session = await this.findSession(request)
    if (!session) {
      if (token) {
        throw new ApiError({
          code: 'SESSION_EXPIRED',
          message: 'Сессия закончилась. Войдите снова.',
          status: 401,
        })
      }
      throw new ApiError({
        code: 'AUTH_REQUIRED',
        message: 'Требуется авторизация.',
        status: 401,
      })
    }
    if (
      requireCsrf &&
      !this.crypto.matches(
        session.csrfToken,
        String(request.headers['x-csrf-token'] ?? ''),
      )
    ) {
      throw new ApiError({
        code: 'CSRF_INVALID',
        message: 'Сессия устарела. Обновите страницу и повторите действие.',
        status: 403,
      })
    }

    return session
  }

  async verify(challengeId: string, body: unknown, reply: FastifyReply) {
    this.validation.assertHttp('verifyAuthChallengeRequest', body)
    const { code } = body as { readonly code: string }
    const now = new Date()
    const challenge = await this.database.client.authChallenge.findUnique({
      where: { id: challengeId },
    })
    if (
      !challenge ||
      challenge.consumedAt ||
      challenge.expiresAt.getTime() <= now.getTime()
    ) {
      throw this.expiredCodeError()
    }
    if (challenge.attemptCount >= this.config.auth.maxVerifyAttempts) {
      throw this.rateLimitError(this.config.auth.challengeTtlSeconds)
    }
    const submittedHash = this.crypto.hashChallengeCode(challenge.id, code)
    if (!this.crypto.matches(challenge.codeHash, submittedHash)) {
      await this.database.client.authChallenge.update({
        data: { attemptCount: { increment: 1 } },
        where: { id: challenge.id },
      })
      throw new ApiError({
        code: 'AUTH_CODE_INVALID',
        message: 'Код не подошёл.',
        status: 401,
      })
    }

    const sessionToken = this.crypto.createOpaqueToken()
    const csrfToken = this.crypto.createCsrfToken(sessionToken)
    const expiresAt = addSeconds(now, this.config.auth.sessionTtlSeconds)
    const result = await this.database.client.$transaction(
      async (transaction) => {
        const consumed = await transaction.authChallenge.updateMany({
          data: { consumedAt: now },
          where: { consumedAt: null, id: challenge.id },
        })
        if (consumed.count !== 1) throw this.expiredCodeError()
        const user = await transaction.user.upsert({
          create: {
            id: randomUUID(),
            locale: challenge.locale,
            phone: challenge.contact,
          },
          update: { locale: challenge.locale },
          where: { phone: challenge.contact },
        })
        const session = await transaction.session.create({
          data: {
            csrfTokenHash: this.crypto.hashSessionToken(csrfToken),
            expiresAt,
            id: randomUUID(),
            tokenHash: this.crypto.hashSessionToken(sessionToken),
            userId: user.id,
          },
        })
        return { session, user }
      },
    )
    reply.setCookie(this.config.auth.cookieName, sessionToken, {
      httpOnly: true,
      maxAge: this.config.auth.sessionTtlSeconds,
      path: '/api/v1',
      sameSite: 'lax',
      secure: this.config.auth.cookieSecure,
    })

    return { csrfToken, user: mapUser(result.user) }
  }

  private async createChallengeRecord(input: {
    readonly contact: string
    readonly contactHash: string
    readonly locale: string
    readonly now: Date
    readonly requesterHash: string
  }) {
    const id = randomUUID()
    const expiresAt = addSeconds(
      input.now,
      this.config.auth.challengeTtlSeconds,
    )
    const resendAvailableAt = addSeconds(
      input.now,
      this.config.auth.resendCooldownSeconds,
    )
    await this.database.client.authChallenge.create({
      data: {
        codeHash: this.crypto.hashChallengeCode(
          id,
          this.config.auth.fakeOtpCode,
        ),
        contact: input.contact,
        contactHash: input.contactHash,
        expiresAt,
        id,
        locale: input.locale,
        requesterHash: input.requesterHash,
        resendAvailableAt,
      },
    })

    return {
      challengeId: id,
      expiresAt: expiresAt.toISOString(),
      maskedContact: maskPhone(input.contact),
      resendAvailableAt: resendAvailableAt.toISOString(),
    }
  }

  private expiredCodeError() {
    return new ApiError({
      code: 'AUTH_CODE_EXPIRED',
      message: 'Срок действия кода закончился.',
      status: 401,
    })
  }

  private async findSession(
    request: FastifyRequest,
  ): Promise<AuthenticatedSession | null> {
    const token = request.cookies[this.config.auth.cookieName]
    if (!token) return null
    const record = await this.database.client.session.findFirst({
      include: { user: true },
      where: {
        expiresAt: { gt: new Date() },
        invalidatedAt: null,
        tokenHash: this.crypto.hashSessionToken(token),
        user: { deletedAt: null },
      },
    })
    if (!record) return null

    return {
      csrfToken: this.crypto.createCsrfToken(token),
      sessionId: record.id,
      user: mapUser(record.user),
    }
  }

  private rateLimitError(retryAfterSeconds: number) {
    return new ApiError({
      code: 'RATE_LIMITED',
      message: 'Слишком много запросов. Повторите попытку позже.',
      retryAfterSeconds,
      retryable: true,
      status: 429,
    })
  }
}
