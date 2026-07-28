import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Param,
  Post,
  Req,
} from '@nestjs/common'
import type { FastifyRequest } from 'fastify'

import { AuthService } from '@api/modules/auth/auth.service.js'

import { RenderService } from './render.service.js'

@Controller('projects/:projectId/render-jobs')
export class RenderController {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(RenderService) private readonly render: RenderService,
  ) {}

  @Post()
  async create(
    @Param('projectId') projectId: string,
    @Body() body: unknown,
    @Headers('idempotency-key') idempotencyKey: string,
    @Req() request: FastifyRequest,
  ) {
    const session = await this.auth.requireSession(request, true)
    return this.render.create(projectId, body, idempotencyKey, session.user.id)
  }

  @Get(':renderJobId')
  async get(
    @Param('projectId') projectId: string,
    @Req() request: FastifyRequest,
  ) {
    const session = await this.auth.requireSession(request)
    return this.render.get(projectId, session.user.id)
  }
}
