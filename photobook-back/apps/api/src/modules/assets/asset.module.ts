import { Module } from '@nestjs/common'

import { AuthModule } from '@api/modules/auth/auth.module.js'
import { DatabaseModule } from '@api/modules/database/database.module.js'
import { StorageModule } from '@api/modules/storage/storage.module.js'

import { AssetQueryService } from './asset-query.service.js'
import { AssetUploadService } from './asset-upload.service.js'
import { AssetController } from './asset.controller.js'

@Module({
  imports: [AuthModule, DatabaseModule, StorageModule],
  controllers: [AssetController],
  providers: [AssetQueryService, AssetUploadService],
})
export class AssetModule {}
