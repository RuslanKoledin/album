import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common'

import { HealthService } from './health.service.js'

@Controller('health')
export class HealthController {
  constructor(
    @Inject(HealthService) private readonly healthService: HealthService,
  ) {}

  @Get('live')
  liveness() {
    return { status: 'ok' as const }
  }

  @Get('ready')
  async readiness() {
    const checks = await this.healthService.readiness()
    const ready = checks.database && checks.storage

    if (!ready) {
      throw new ServiceUnavailableException({
        checks,
        status: 'not_ready',
      })
    }

    return {
      checks,
      status: 'ready' as const,
    }
  }
}
