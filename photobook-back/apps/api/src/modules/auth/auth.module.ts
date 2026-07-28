import { Module } from '@nestjs/common'

import { DatabaseModule } from '@api/modules/database/database.module.js'

import { AuthController } from './auth.controller.js'
import { AuthCryptoService } from './auth-crypto.service.js'
import { AuthService } from './auth.service.js'

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [AuthCryptoService, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
