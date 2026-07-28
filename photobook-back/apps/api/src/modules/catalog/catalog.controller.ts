import { Controller, Get, Inject, Param } from '@nestjs/common'

import { CatalogService } from './catalog.service.js'

@Controller('catalog')
export class CatalogController {
  constructor(
    @Inject(CatalogService) private readonly catalog: CatalogService,
  ) {}

  @Get('versions/:catalogVersion')
  getVersion(@Param('catalogVersion') catalogVersion: string) {
    return this.catalog.getVersion(catalogVersion)
  }
}
