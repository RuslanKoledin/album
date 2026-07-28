import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Req,
} from '@nestjs/common'
import type { FastifyRequest } from 'fastify'

import { AuthService } from '@api/modules/auth/auth.service.js'

import { AssetQueryService } from './asset-query.service.js'
import { AssetUploadService } from './asset-upload.service.js'

@Controller('projects/:projectId')
export class AssetController {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(AssetQueryService)
    private readonly assetQuery: AssetQueryService,
    @Inject(AssetUploadService)
    private readonly assetUpload: AssetUploadService,
  ) {}

  @Get('assets')
  async list(
    @Param('projectId') projectId: string,
    @Req() request: FastifyRequest,
  ) {
    const session = await this.auth.requireSession(request)
    return this.assetQuery.list(projectId, session.user.id)
  }

  @Post('upload-batches')
  async createBatch(
    @Param('projectId') projectId: string,
    @Body() body: unknown,
    @Headers('idempotency-key') idempotencyKey: string,
    @Req() request: FastifyRequest,
  ) {
    const session = await this.auth.requireSession(request, true)
    return this.assetUpload.createBatch(
      projectId,
      body,
      idempotencyKey,
      session.user.id,
    )
  }

  @Post('assets/:assetId/complete')
  @HttpCode(HttpStatus.OK)
  async complete(
    @Param('projectId') projectId: string,
    @Param('assetId') assetId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest,
  ) {
    const session = await this.auth.requireSession(request, true)
    return this.assetUpload.complete(projectId, assetId, body, session.user.id)
  }

  @Post('assets/:assetId/renew-upload')
  @HttpCode(HttpStatus.OK)
  async renew(
    @Param('projectId') projectId: string,
    @Param('assetId') assetId: string,
    @Req() request: FastifyRequest,
  ) {
    const session = await this.auth.requireSession(request, true)
    return this.assetUpload.renew(projectId, assetId, session.user.id)
  }
}
