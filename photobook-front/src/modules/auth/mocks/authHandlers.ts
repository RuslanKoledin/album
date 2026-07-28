import { createAuthChallengeHandler } from './createAuthChallengeHandler'
import { getAuthSessionHandler } from './getAuthSessionHandler'
import { logoutHandler } from './logoutHandler'
import { resendAuthChallengeHandler } from './resendAuthChallengeHandler'
import { verifyAuthChallengeHandler } from './verifyAuthChallengeHandler'

export const authHandlers = [
  getAuthSessionHandler,
  createAuthChallengeHandler,
  verifyAuthChallengeHandler,
  resendAuthChallengeHandler,
  logoutHandler,
]
