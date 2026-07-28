import { Inject, Injectable } from '@nestjs/common'

import { ApiError } from '@api/common/http/api-error.js'
import { ContractValidationService } from '@api/common/http/contract-validation.service.js'
import { DatabaseService } from '@api/modules/database/database.service.js'

@Injectable()
export class CatalogService {
  constructor(
    @Inject(DatabaseService) private readonly database: DatabaseService,
    @Inject(ContractValidationService)
    private readonly validation: ContractValidationService,
  ) {}

  async getVersion(catalogVersion: string) {
    const catalog = await this.database.client.catalogVersion.findUnique({
      where: { id: catalogVersion },
    })
    if (!catalog?.publishedAt) {
      throw new ApiError({
        code: 'CATALOG_VERSION_UNAVAILABLE',
        message: 'Версия каталога недоступна.',
        status: 404,
      })
    }
    this.validation.assertHttp('catalogVersionResponse', catalog.payload)

    return catalog.payload
  }
}
