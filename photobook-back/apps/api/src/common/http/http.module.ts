import { Global, Module } from '@nestjs/common'

import { ContractValidationService } from './contract-validation.service.js'

@Global()
@Module({
  providers: [ContractValidationService],
  exports: [ContractValidationService],
})
export class HttpModule {}
