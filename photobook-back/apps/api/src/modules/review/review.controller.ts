import { Body, Controller, Inject, Param, Post, Req, Res } from '@nestjs/common'
import type { FastifyReply, FastifyRequest } from 'fastify'

import { AuthService } from '@api/modules/auth/auth.service.js'

import { ApprovalService } from './approval.service.js'
import { PreflightService } from './preflight.service.js'

@Controller('projects/:projectId')
export class ReviewController {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(ApprovalService) private readonly approvals: ApprovalService,
    @Inject(PreflightService) private readonly preflight: PreflightService,
  ) {}

  @Post('preflight-runs')
  async createPreflight(
    @Param('projectId') projectId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest,
  ) {
    const session = await this.auth.requireSession(request, true)
    return this.preflight.create(projectId, body, session.user.id)
  }

  @Post('approvals')
  async createApproval(
    @Param('projectId') projectId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const session = await this.auth.requireSession(request, true)
    const result = await this.approvals.create(projectId, body, session.user.id)
    response.status(result.statusCode)

    return result.value
  }
}
