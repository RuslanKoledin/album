import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common'
import type { FastifyRequest } from 'fastify'

import { AuthService } from '@api/modules/auth/auth.service.js'

import { ProjectService } from './project.service.js'

@Controller('projects')
export class ProjectController {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(ProjectService) private readonly projects: ProjectService,
  ) {}

  @Post()
  async create(
    @Body() body: unknown,
    @Headers('idempotency-key') idempotencyKey: string,
    @Req() request: FastifyRequest,
  ) {
    const session = await this.auth.requireSession(request, true)
    return this.projects.create(body, idempotencyKey, session.user.id)
  }

  @Get()
  async list(@Req() request: FastifyRequest) {
    const session = await this.auth.requireSession(request)
    return this.projects.list(session.user.id)
  }

  @Get(':projectId')
  async get(
    @Param('projectId') projectId: string,
    @Req() request: FastifyRequest,
  ) {
    const session = await this.auth.requireSession(request)
    return this.projects.get(projectId, session.user.id)
  }

  @Put(':projectId/document')
  async saveDocument(
    @Param('projectId') projectId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest,
  ) {
    const session = await this.auth.requireSession(request, true)
    return this.projects.saveDocument(projectId, body, session.user.id)
  }
}
