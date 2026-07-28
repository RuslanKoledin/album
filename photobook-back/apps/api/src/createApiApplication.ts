import { randomUUID } from 'node:crypto'
import fastifyCookie from '@fastify/cookie'
import { RequestMethod } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify'

import type { AppConfig } from '@photobook/config'

import { AppModule } from '@api/app.module.js'
import { ApiExceptionFilter } from '@api/common/http/api-exception.filter.js'

const REDACTED_LOG_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers.set-cookie',
  'req.body.code',
  'req.body.contact',
  'req.body.phone',
  'req.body.uploadUrl',
  'req.body.thumbnailUrl',
  'response.body.csrfToken',
  'response.body.uploadUrl',
  'response.body.thumbnailUrl',
]

export async function createApiApplication(config: AppConfig) {
  const adapter = new FastifyAdapter({
    genReqId: () => randomUUID(),
    logger: {
      level: config.logLevel,
      redact: {
        censor: '[REDACTED]',
        paths: REDACTED_LOG_PATHS,
      },
    },
    requestIdHeader: false,
    trustProxy: config.trustProxy,
  })
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    { logger: false },
  )

  await app.register(fastifyCookie)
  app
    .getHttpAdapter()
    .getInstance()
    .addHook('onRequest', (request, reply, done) => {
      reply.header('x-request-id', request.id)
      done()
    })
  app.enableCors({
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
    origin: [...config.corsOrigins],
  })
  app.setGlobalPrefix('api/v1', {
    exclude: [
      { method: RequestMethod.GET, path: 'health/live' },
      { method: RequestMethod.GET, path: 'health/ready' },
    ],
  })
  app.useGlobalFilters(new ApiExceptionFilter())
  app.enableShutdownHooks()

  return app
}
