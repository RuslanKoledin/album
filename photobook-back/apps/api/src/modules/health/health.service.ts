import { Inject, Injectable } from '@nestjs/common'

import { DatabaseService } from '@api/modules/database/database.service.js'
import { StorageService } from '@api/modules/storage/storage.service.js'

export interface DependencyCheck {
  readonly database: boolean
  readonly storage: boolean
}

const READINESS_TIMEOUT_MS = 2_000

async function settlesWithin(operation: Promise<unknown>, timeoutMs: number) {
  let timeout: NodeJS.Timeout | undefined

  try {
    return await Promise.race([
      operation.then(
        () => true,
        () => false,
      ),
      new Promise<false>((resolve) => {
        timeout = setTimeout(() => resolve(false), timeoutMs)
      }),
    ])
  } finally {
    if (timeout) clearTimeout(timeout)
  }
}

@Injectable()
export class HealthService {
  constructor(
    @Inject(DatabaseService) private readonly database: DatabaseService,
    @Inject(StorageService) private readonly storage: StorageService,
  ) {}

  async readiness(): Promise<DependencyCheck> {
    const [database, storage] = await Promise.all([
      settlesWithin(this.database.ping(), READINESS_TIMEOUT_MS),
      settlesWithin(this.storage.ping(), READINESS_TIMEOUT_MS),
    ])

    return { database, storage }
  }
}
