import { Body, Controller, Inject, Post } from '@nestjs/common'

import { PricingService } from './pricing.service.js'

@Controller('price-quotes')
export class PricingController {
  constructor(
    @Inject(PricingService) private readonly pricing: PricingService,
  ) {}

  @Post()
  createQuote(@Body() body: unknown) {
    return this.pricing.createQuote(body)
  }
}
