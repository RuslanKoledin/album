import { Injectable } from '@nestjs/common'

import {
  ContractValidator,
  type ContractValidationResult,
} from '@photobook/contracts'

import { ApiError } from './api-error.js'

@Injectable()
export class ContractValidationService {
  private readonly validator = new ContractValidator()

  assertBookDocument(value: unknown) {
    this.assertValid(this.validator.validateBookDocument(value))
  }

  assertHttp(schemaName: string, value: unknown) {
    this.assertValid(this.validator.validateHttp(schemaName, value))
  }

  private assertValid(result: ContractValidationResult): asserts result is {
    readonly ok: true
  } {
    if (result.ok) return

    throw new ApiError({
      code: 'VALIDATION_FAILED',
      fieldErrors: result.issues.map((issue) => ({
        field: issue.instancePath || '/',
        message: issue.message,
      })),
      message: 'Запрос содержит недопустимые данные.',
      status: 422,
    })
  }
}
