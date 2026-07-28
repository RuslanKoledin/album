import { Module } from '@nestjs/common'

import { HttpModule } from '@api/common/http/http.module.js'
import { AuthModule } from '@api/modules/auth/auth.module.js'
import { DatabaseModule } from '@api/modules/database/database.module.js'

import { ApprovalService } from './approval.service.js'
import { PreflightService } from './preflight.service.js'
import { ReviewController } from './review.controller.js'

@Module({
  controllers: [ReviewController],
  imports: [AuthModule, DatabaseModule, HttpModule],
  providers: [ApprovalService, PreflightService],
})
export class ReviewModule {}
