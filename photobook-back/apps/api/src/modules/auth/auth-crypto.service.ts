import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { Inject, Injectable } from '@nestjs/common'

import { APP_CONFIG, type AppConfig } from '@photobook/config'

@Injectable()
export class AuthCryptoService {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  createOpaqueToken() {
    return randomBytes(32).toString('base64url')
  }

  createCsrfToken(sessionToken: string) {
    return this.hash(`csrf:${sessionToken}`)
  }

  hashChallengeCode(challengeId: string, code: string) {
    return this.hash(`otp:${challengeId}:${code}`)
  }

  hashContact(contact: string) {
    return this.hash(`contact:${contact}`)
  }

  hashRequester(requester: string) {
    return this.hash(`requester:${requester}`)
  }

  hashSessionToken(token: string) {
    return this.hash(`session:${token}`)
  }

  matches(left: string, right: string) {
    const leftBuffer = Buffer.from(left)
    const rightBuffer = Buffer.from(right)
    return (
      leftBuffer.length === rightBuffer.length &&
      timingSafeEqual(leftBuffer, rightBuffer)
    )
  }

  private hash(value: string) {
    return createHmac('sha256', this.config.auth.hashSecret)
      .update(value)
      .digest('base64url')
  }
}
