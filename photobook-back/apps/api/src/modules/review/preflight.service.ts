import { randomUUID } from 'node:crypto'
import { Inject, Injectable } from '@nestjs/common'

import { ReviewRepository } from '@photobook/database'
import type { Prisma } from '@photobook/database'
import {
  validateBookDocument,
  type BookConfiguration,
  type BookDocument,
} from '@photobook/domain'

import { ApiError } from '@api/common/http/api-error.js'
import { ContractValidationService } from '@api/common/http/contract-validation.service.js'
import { DatabaseService } from '@api/modules/database/database.service.js'

import { createPreflightIssues } from './preflight-issues.js'
import { mapPreflightRun } from './review.mapper.js'
import type { PreflightRunRequest } from './review.types.js'

@Injectable()
export class PreflightService {
  private readonly reviews: ReviewRepository

  constructor(
    @Inject(DatabaseService) database: DatabaseService,
    @Inject(ContractValidationService)
    private readonly validation: ContractValidationService,
  ) {
    this.reviews = new ReviewRepository(database.client)
  }

  async create(projectId: string, body: unknown, ownerId: string) {
    this.validation.assertHttp('preflightRunRequest', body)
    const request = body as PreflightRunRequest
    const context = await this.reviews.findPreflightContext(projectId, ownerId)
    if (!context?.latestRevision) throw this.notFound()
    if (context.latestRevision.id !== request.revisionId) {
      throw this.revisionConflict(context.latestRevision.id)
    }
    if (!context.catalogVersion.publishedAt) {
      throw new ApiError({
        code: 'VALIDATION_FAILED',
        message: 'Версия каталога проекта недоступна.',
        status: 422,
      })
    }
    const document = context.latestRevision.document as unknown as BookDocument
    const configuration = context.catalogVersion
      .payload as unknown as BookConfiguration
    this.validation.assertBookDocument(document)
    this.validation.assertHttp('catalogVersionResponse', configuration)
    const result = validateBookDocument(document, configuration)
    const issues = createPreflightIssues(
      document,
      result.issues,
      context.assets,
    )
    const created = await this.reviews.createPreflightRun({
      hasBlockingIssues: issues.some(({ severity }) => severity === 'blocking'),
      issues: issues as unknown as Prisma.InputJsonValue,
      ownerId,
      projectId,
      revisionId: request.revisionId,
      runId: randomUUID(),
    })
    if (created.kind === 'not_found') throw this.notFound()
    if (created.kind === 'revision_conflict') {
      throw this.revisionConflict(created.latestRevisionId)
    }
    const response = mapPreflightRun(created.run)
    this.validation.assertHttp('preflightRun', response)

    return response
  }

  private notFound() {
    return new ApiError({
      code: 'RESOURCE_NOT_FOUND',
      message: 'Проект не найден.',
      status: 404,
    })
  }

  private revisionConflict(latestRevisionId: string) {
    return new ApiError({
      code: 'PROJECT_REVISION_CONFLICT',
      details: { latestRevisionId },
      message: 'Макет был изменён. Проверьте актуальную версию.',
      status: 409,
    })
  }
}
