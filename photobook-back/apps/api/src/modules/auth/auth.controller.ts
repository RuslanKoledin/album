import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Ip,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common'
import type { FastifyReply, FastifyRequest } from 'fastify'

import { AuthService } from './auth.service.js'

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Post('challenges')
  createChallenge(@Body() body: unknown, @Ip() requester: string) {
    return this.auth.createChallenge(body, requester)
  }

  @Post('challenges/:challengeId/resend')
  @HttpCode(200)
  resend(@Param('challengeId') challengeId: string) {
    return this.auth.resend(challengeId)
  }

  @Post('challenges/:challengeId/verify')
  @HttpCode(200)
  verify(
    @Param('challengeId') challengeId: string,
    @Body() body: unknown,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    return this.auth.verify(challengeId, body, reply)
  }

  @Get('session')
  getSession(@Req() request: FastifyRequest) {
    return this.auth.getSession(request)
  }

  @Post('logout')
  @HttpCode(204)
  async logout(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    await this.auth.logout(request, reply)
  }
}
