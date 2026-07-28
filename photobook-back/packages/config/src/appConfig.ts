export const APP_CONFIG = Symbol('APP_CONFIG')

export type AppEnvironment = 'local' | 'test' | 'staging' | 'production'
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface DatabaseConfig {
  readonly url: string
}

export interface AuthConfig {
  readonly challengeRateLimit: number
  readonly challengeRateWindowSeconds: number
  readonly challengeTtlSeconds: number
  readonly cookieName: string
  readonly cookieSecure: boolean
  readonly fakeOtpCode: string
  readonly hashSecret: string
  readonly maxVerifyAttempts: number
  readonly resendCooldownSeconds: number
  readonly sessionTtlSeconds: number
}

export interface StorageConfig {
  readonly accessKey: string
  readonly bucket: string
  readonly endpoint: string
  readonly forcePathStyle: boolean
  readonly previewUrlTtlSeconds: number
  readonly region: string
  readonly secretKey: string
  readonly uploadUrlTtlSeconds: number
}

export interface AppConfig {
  readonly apiHost: string
  readonly apiPort: number
  readonly auth: AuthConfig
  readonly corsOrigins: readonly string[]
  readonly database: DatabaseConfig
  readonly environment: AppEnvironment
  readonly logLevel: LogLevel
  readonly storage: StorageConfig
  readonly trustProxy: boolean
}

type EnvironmentSource = Readonly<Record<string, string | undefined>>

const LOCAL_DATABASE_URL =
  'postgresql://photobook:photobook_local@localhost:5432/photobook?schema=public'

const APP_ENVIRONMENTS: readonly AppEnvironment[] = [
  'local',
  'test',
  'staging',
  'production',
]

const LOG_LEVELS: readonly LogLevel[] = ['debug', 'info', 'warn', 'error']

function readEnum<Value extends string>(
  source: EnvironmentSource,
  key: string,
  values: readonly Value[],
  fallback: Value,
) {
  const value = source[key]?.trim() || fallback
  if (!values.includes(value as Value)) {
    throw new Error(`${key} contains an unsupported value`)
  }

  return value as Value
}

function readBoolean(
  source: EnvironmentSource,
  key: string,
  fallback: boolean,
) {
  const value = source[key]?.trim()
  if (!value) return fallback
  if (value === 'true') return true
  if (value === 'false') return false

  throw new Error(`${key} must be true or false`)
}

function readPort(source: EnvironmentSource) {
  const rawValue = source.API_PORT?.trim() || '4000'
  const value = Number(rawValue)
  if (!Number.isInteger(value) || value < 1 || value > 65_535) {
    throw new Error('API_PORT must be an integer between 1 and 65535')
  }

  return value
}

function readPositiveInteger(
  source: EnvironmentSource,
  key: string,
  fallback: number,
) {
  const rawValue = source[key]?.trim()
  const value = rawValue ? Number(rawValue) : fallback
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${key} must be a positive integer`)
  }

  return value
}

function readRequired(
  source: EnvironmentSource,
  key: string,
  fallback?: string,
) {
  const value = source[key]?.trim() || fallback
  if (!value) throw new Error(`${key} is required`)

  return value
}

function readCorsOrigins(
  source: EnvironmentSource,
  environment: AppEnvironment,
) {
  const fallback =
    environment === 'local' || environment === 'test'
      ? 'http://localhost:5173'
      : undefined
  const origins = readRequired(source, 'CORS_ORIGINS', fallback)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  if (origins.some((origin) => origin === '*')) {
    throw new Error('CORS_ORIGINS cannot contain a wildcard')
  }

  return origins
}

export function loadAppConfig(
  source: EnvironmentSource = process.env,
): AppConfig {
  const environment = readEnum(source, 'APP_ENV', APP_ENVIRONMENTS, 'local')
  const isLocal = environment === 'local' || environment === 'test'
  const corsOrigins = readCorsOrigins(source, environment)
  if (!isLocal) {
    throw new Error(
      'AUTH_PROVIDER must be configured before staging or production startup',
    )
  }

  return {
    apiHost: readRequired(source, 'API_HOST', '0.0.0.0'),
    apiPort: readPort(source),
    auth: {
      challengeRateLimit: readPositiveInteger(
        source,
        'AUTH_CHALLENGE_RATE_LIMIT',
        5,
      ),
      challengeRateWindowSeconds: readPositiveInteger(
        source,
        'AUTH_CHALLENGE_RATE_WINDOW_SECONDS',
        600,
      ),
      challengeTtlSeconds: readPositiveInteger(
        source,
        'AUTH_CHALLENGE_TTL_SECONDS',
        300,
      ),
      cookieName: readRequired(source, 'AUTH_COOKIE_NAME', 'photobook_session'),
      cookieSecure: !isLocal,
      fakeOtpCode: readRequired(
        source,
        'AUTH_FAKE_OTP_CODE',
        isLocal ? '246810' : undefined,
      ),
      hashSecret: readRequired(
        source,
        'AUTH_HASH_SECRET',
        isLocal ? 'photobook-local-auth-secret-change-me' : undefined,
      ),
      maxVerifyAttempts: readPositiveInteger(
        source,
        'AUTH_MAX_VERIFY_ATTEMPTS',
        5,
      ),
      resendCooldownSeconds: readPositiveInteger(
        source,
        'AUTH_RESEND_COOLDOWN_SECONDS',
        60,
      ),
      sessionTtlSeconds: readPositiveInteger(
        source,
        'AUTH_SESSION_TTL_SECONDS',
        2_592_000,
      ),
    },
    corsOrigins,
    database: {
      url: readRequired(
        source,
        'DATABASE_URL',
        isLocal ? LOCAL_DATABASE_URL : undefined,
      ),
    },
    environment,
    logLevel: readEnum(source, 'LOG_LEVEL', LOG_LEVELS, 'info'),
    storage: {
      accessKey: readRequired(
        source,
        'STORAGE_ACCESS_KEY',
        isLocal ? 'photobook-local' : undefined,
      ),
      bucket: readRequired(
        source,
        'STORAGE_BUCKET',
        isLocal ? 'photobook-local' : undefined,
      ),
      endpoint: readRequired(
        source,
        'STORAGE_ENDPOINT',
        isLocal ? 'http://localhost:9000' : undefined,
      ),
      forcePathStyle: readBoolean(source, 'STORAGE_FORCE_PATH_STYLE', isLocal),
      previewUrlTtlSeconds: readPositiveInteger(
        source,
        'STORAGE_PREVIEW_URL_TTL_SECONDS',
        900,
      ),
      region: readRequired(
        source,
        'STORAGE_REGION',
        isLocal ? 'us-east-1' : undefined,
      ),
      secretKey: readRequired(
        source,
        'STORAGE_SECRET_KEY',
        isLocal ? 'photobook-local-secret' : undefined,
      ),
      uploadUrlTtlSeconds: readPositiveInteger(
        source,
        'STORAGE_UPLOAD_URL_TTL_SECONDS',
        600,
      ),
    },
    trustProxy: readBoolean(source, 'TRUST_PROXY', false),
  }
}
