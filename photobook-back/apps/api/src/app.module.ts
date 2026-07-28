import { Module } from '@nestjs/common'

import { RuntimeConfigModule } from '@api/modules/config/runtime-config.module.js'
import { HttpModule } from '@api/common/http/http.module.js'
import { DatabaseModule } from '@api/modules/database/database.module.js'
import { HealthModule } from '@api/modules/health/health.module.js'
import { AuthModule } from '@api/modules/auth/auth.module.js'
import { AssetModule } from '@api/modules/assets/asset.module.js'
import { CatalogModule } from '@api/modules/catalog/catalog.module.js'
import { ProjectModule } from '@api/modules/projects/project.module.js'
import { PricingModule } from '@api/modules/pricing/pricing.module.js'
import { ReviewModule } from '@api/modules/review/review.module.js'
import { RenderModule } from '@api/modules/render/render.module.js'
import { StorageModule } from '@api/modules/storage/storage.module.js'

@Module({
  imports: [
    RuntimeConfigModule,
    HttpModule,
    DatabaseModule,
    AuthModule,
    AssetModule,
    CatalogModule,
    PricingModule,
    ProjectModule,
    ReviewModule,
    RenderModule,
    HealthModule,
    StorageModule,
  ],
})
export class AppModule {}
