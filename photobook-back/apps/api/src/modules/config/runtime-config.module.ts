import { Global, Module } from '@nestjs/common'

import { APP_CONFIG, loadAppConfig } from '@photobook/config'

@Global()
@Module({
  providers: [
    {
      provide: APP_CONFIG,
      useFactory: loadAppConfig,
    },
  ],
  exports: [APP_CONFIG],
})
export class RuntimeConfigModule {}
