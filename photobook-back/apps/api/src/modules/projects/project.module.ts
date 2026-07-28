import { Module } from '@nestjs/common'

import { AuthModule } from '@api/modules/auth/auth.module.js'
import { DatabaseModule } from '@api/modules/database/database.module.js'

import { ProjectController } from './project.controller.js'
import { ProjectService } from './project.service.js'

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
