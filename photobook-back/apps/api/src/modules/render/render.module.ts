import { Module } from '@nestjs/common'

import { HttpModule } from '@api/common/http/http.module.js'
import { AuthModule } from '@api/modules/auth/auth.module.js'
import { DatabaseModule } from '@api/modules/database/database.module.js'

import { RenderController } from './render.controller.js'
import { RenderService } from './render.service.js'

@Module({
  controllers: [RenderController],
  imports: [AuthModule, DatabaseModule, HttpModule],
  providers: [RenderService],
})
export class RenderModule {}
