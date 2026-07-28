import { describe, expect, it } from 'vitest'

import { DEVELOPMENT_AUTH_OTP } from '@auth/model'
import { createHttpContractValidator } from '@tests/contracts/httpContract'

import {
  createMockAuthChallenge,
  getMockAuthSession,
  verifyMockAuthChallenge,
} from './authMockState'

describe('auth MSW fixtures', () => {
  it('matches the frozen challenge and verification schemas', () => {
    const challenge = createMockAuthChallenge('+996555123456')
    const verifyResult = verifyMockAuthChallenge(
      challenge.challengeId,
      DEVELOPMENT_AUTH_OTP,
    )

    expect(
      createHttpContractValidator('authChallengeResponse')(challenge),
    ).toBe(true)
    expect(verifyResult.kind).toBe('success')
    if (verifyResult.kind === 'success') {
      expect(
        createHttpContractValidator('authVerificationResponse')(
          verifyResult.value,
        ),
      ).toBe(true)
    }
  })

  it('matches the frozen authenticated session schema', () => {
    expect(
      createHttpContractValidator('authSessionResponse')(getMockAuthSession()),
    ).toBe(true)
  })
})
