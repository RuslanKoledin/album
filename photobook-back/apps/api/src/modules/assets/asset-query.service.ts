import { Inject, Injectable } from '@nestjs/common'

import { AssetRepository } from '@photobook/database'

import { ApiError } from '@api/common/http/api-error.js'
import { ContractValidationService } from '@api/common/http/contract-validation.service.js'
import { DatabaseService } from '@api/modules/database/database.service.js'
import { StorageService } from '@api/modules/storage/storage.service.js'

import { mapAsset } from './asset.mapper.js'

@Injectable()
export class AssetQueryService {
  private readonly assets: AssetRepository

  constructor(
    @Inject(DatabaseService) database: DatabaseService,
    @Inject(StorageService) private readonly storage: StorageService,
    @Inject(ContractValidationService)
    private readonly validation: ContractValidationService,
  ) {
    this.assets = new AssetRepository(database.client)
  }

  async list(projectId: string, ownerId: string) {
    const assets = await this.assets.findOwnedAssets(projectId, ownerId)
    if (!assets) {
      throw new ApiError({
        code: 'RESOURCE_NOT_FOUND',
        message: 'Проект не найден.',
        status: 404,
      })
    }
    const response = {
      items: await Promise.all(
        assets.map((asset) => mapAsset(asset, this.storage)),
      ),
    }
    this.validation.assertHttp('assetList', response)

    return response
  }
}
