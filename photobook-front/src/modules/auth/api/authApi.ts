import { baseApi, setCsrfToken } from '@shared/api'

import type {
  AuthChallengeRequestDto,
  AuthChallengeResponseDto,
  AuthSessionResponseDto,
  AuthVerificationResponseDto,
  LogoutArgs,
  VerifyAuthChallengeArgs,
} from '@auth/model'

const api = baseApi.enhanceEndpoints({ addTagTypes: ['Session'] as const })

const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAuthSession: build.query<AuthSessionResponseDto, void>({
      query: () => '/v1/auth/session',
      providesTags: ['Session'],
      async onQueryStarted(_argument, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          setCsrfToken(data.csrfToken)
        } catch {
          setCsrfToken(null)
        }
      },
    }),
    createAuthChallenge: build.mutation<
      AuthChallengeResponseDto,
      AuthChallengeRequestDto
    >({
      query: (body) => ({
        url: '/v1/auth/challenges',
        method: 'POST',
        body,
      }),
    }),
    verifyAuthChallenge: build.mutation<
      AuthVerificationResponseDto,
      VerifyAuthChallengeArgs
    >({
      query: ({ challengeId, body }) => ({
        url: `/v1/auth/challenges/${encodeURIComponent(challengeId)}/verify`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Session'],
      async onQueryStarted(_argument, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          setCsrfToken(data.csrfToken)
        } catch {
          // The form owns verification error copy; keep the current session token.
        }
      },
    }),
    resendAuthChallenge: build.mutation<AuthChallengeResponseDto, string>({
      query: (challengeId) => ({
        url: `/v1/auth/challenges/${encodeURIComponent(challengeId)}/resend`,
        method: 'POST',
      }),
    }),
    logout: build.mutation<void, LogoutArgs>({
      query: ({ csrfToken }) => ({
        url: '/v1/auth/logout',
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfToken },
      }),
      invalidatesTags: ['Session'],
      async onQueryStarted(_argument, { queryFulfilled }) {
        try {
          await queryFulfilled
          setCsrfToken(null)
        } catch {
          // A failed logout keeps the current session and CSRF token intact.
        }
      },
    }),
  }),
})

export const {
  useCreateAuthChallengeMutation,
  useGetAuthSessionQuery,
  useLogoutMutation,
  useResendAuthChallengeMutation,
  useVerifyAuthChallengeMutation,
} = authApi
