import { Inject, Injectable, type OnApplicationShutdown } from '@nestjs/common'

import { APP_CONFIG, type AppConfig } from '@photobook/config'
import {
  createPrismaClient,
  type PhotobookPrismaClient,
} from '@photobook/database'

@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  readonly client: PhotobookPrismaClient

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.client = createPrismaClient(config.database.url)
  }

  async ping() {
    await this.client.$queryRawUnsafe('SELECT 1')
  }

  async onApplicationShutdown() {
    await this.client.$disconnect()
  }
}
