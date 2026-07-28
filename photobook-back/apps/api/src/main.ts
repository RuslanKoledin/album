import 'reflect-metadata'

import { loadAppConfig } from '@photobook/config'

import { createApiApplication } from '@api/createApiApplication.js'

async function bootstrap() {
  const config = loadAppConfig()
  const app = await createApiApplication(config)

  await app.listen({
    host: config.apiHost,
    port: config.apiPort,
  })

  app.getHttpAdapter().getInstance().log.info(
    {
      environment: config.environment,
      host: config.apiHost,
      port: config.apiPort,
    },
    'Photobook API is listening',
  )
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error'
  process.stderr.write(`Photobook API failed to start: ${message}\n`)
  process.exitCode = 1
})
