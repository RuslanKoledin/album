import { randomUUID } from 'node:crypto'
import { Inject, Injectable } from '@nestjs/common'

import { ApiError } from '@api/common/http/api-error.js'
import { ContractValidationService } from '@api/common/http/contract-validation.service.js'
import { DatabaseService } from '@api/modules/database/database.service.js'

import type { PriceQuoteRequest } from './pricing.types.js'

const BASE_PRICE_MINOR = 350_000
const EXTRA_SPREAD_PRICE_MINOR = 45_000

interface PriceCatalog {
  readonly productSpecs: readonly {
    readonly id: string
    readonly optionSpecs: readonly {
      readonly id: string
      readonly valueIds: readonly string[]
    }[]
    readonly productId: string
    readonly spreadCount: { readonly max: number; readonly min: number }
  }[]
}

@Injectable()
export class PricingService {
  constructor(
    @Inject(DatabaseService) private readonly database: DatabaseService,
    @Inject(ContractValidationService)
    private readonly validation: ContractValidationService,
  ) {}

  async createQuote(body: unknown) {
    this.validation.assertHttp('priceQuoteRequest', body)
    const request = body as PriceQuoteRequest
    const catalog = await this.database.client.catalogVersion.findUnique({
      where: { id: request.catalogVersion },
    })
    if (!catalog?.publishedAt) throw this.invalidConfiguration()
    this.validation.assertHttp('catalogVersionResponse', catalog.payload)
    const product = (
      catalog.payload as unknown as PriceCatalog
    ).productSpecs.find(
      (item) =>
        item.id === request.productSpecId &&
        item.productId === request.productId,
    )
    if (
      !product ||
      request.spreadCount < product.spreadCount.min ||
      request.spreadCount > product.spreadCount.max ||
      !this.optionsAreValid(product.optionSpecs, request.options)
    ) {
      throw this.invalidConfiguration()
    }

    const extraSpreadCount = request.spreadCount - 1
    const items = [
      {
        code: 'BOOK_BASE',
        label: 'Фотокнига',
        quantity: 1,
        total: { amountMinor: BASE_PRICE_MINOR, currency: 'KGS' },
        unitPrice: { amountMinor: BASE_PRICE_MINOR, currency: 'KGS' },
      },
      ...(extraSpreadCount > 0
        ? [
            {
              code: 'EXTRA_SPREADS',
              label: 'Дополнительные развороты',
              quantity: extraSpreadCount,
              total: {
                amountMinor: extraSpreadCount * EXTRA_SPREAD_PRICE_MINOR,
                currency: 'KGS',
              },
              unitPrice: {
                amountMinor: EXTRA_SPREAD_PRICE_MINOR,
                currency: 'KGS',
              },
            },
          ]
        : []),
    ]
    const response = {
      estimatedReadyDate: null,
      expiresAt: new Date(Date.now() + 15 * 60 * 1_000).toISOString(),
      items,
      priceStatus: 'provisional',
      quoteId: randomUUID(),
      total: {
        amountMinor: items.reduce(
          (sum, item) => sum + item.total.amountMinor,
          0,
        ),
        currency: 'KGS',
      },
    }
    this.validation.assertHttp('priceQuote', response)

    return response
  }

  private invalidConfiguration() {
    return new ApiError({
      code: 'VALIDATION_FAILED',
      fieldErrors: [
        {
          code: 'PRICE_CONFIGURATION_INVALID',
          field: '/',
          message: 'Конфигурация недоступна для расчёта.',
        },
      ],
      message: 'Не удалось рассчитать выбранную конфигурацию.',
      status: 422,
    })
  }

  private optionsAreValid(
    specs: PriceCatalog['productSpecs'][number]['optionSpecs'],
    options: PriceQuoteRequest['options'],
  ) {
    const selected = new Map(
      options.map((item) => [item.optionId, item.valueId]),
    )
    return (
      selected.size === specs.length &&
      specs.every((spec) => {
        const value = selected.get(spec.id)
        return value ? spec.valueIds.includes(value) : false
      })
    )
  }
}
