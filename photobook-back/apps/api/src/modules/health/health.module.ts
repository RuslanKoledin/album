import { Module } from '@nestjs/common'

import { DatabaseModule } from '@api/modules/database/database.module.js'
import { StorageModule } from '@api/modules/storage/storage.module.js'

import { HealthController } from './health.controller.js'
import { HealthService } from './health.service.js'

@Module({
  controllers: [HealthController],
  imports: [DatabaseModule, StorageModule],
  providers: [HealthService],
})
export class HealthModule {}
