import { randomUUID } from 'node:crypto'
import { Inject, Injectable } from '@nestjs/common'

import { ReviewRepository } from '@photobook/database'
import type { Prisma } from '@photobook/database'
import { createJsonHash } from '@photobook/domain'

import { ApiError } from '@api/common/http/api-error.js'
import { ContractValidationService } from '@api/common/http/contract-validation.service.js'
import { DatabaseService } from '@api/modules/database/database.service.js'

import { mapApproval, mapPreflightRun } from './review.mapper.js'
import type {
  CreateApprovalRequest,
  PreflightRunResponse,
} from './review.types.js'

@Injectable()
export class ApprovalService {
  private readonly reviews: ReviewRepository

  constructor(
    @Inject(DatabaseService) database: DatabaseService,
    @Inject(ContractValidationService)
    private readonly validation: ContractValidationService,
  ) {
    this.reviews = new ReviewRepository(database.client)
  }

  async create(projectId: string, body: unknown, ownerId: string) {
    this.validation.assertHttp('createApprovalRequest', body)
    const request = body as CreateApprovalRequest
    const context = await this.reviews.findApprovalContext(
      projectId,
      request.preflightRunId,
      ownerId,
    )
    if (!context) throw this.notFound()
    if (context.latestRevisionId !== request.revisionId) {
      throw this.revisionConflict(context.latestRevisionId)
    }
    if (!context.run) throw this.notFound()
    const run = mapPreflightRun(context.run)
    this.validation.assertHttp('preflightRun', run)
    if (run.revisionId !== request.revisionId) {
      throw this.revisionConflict(context.latestRevisionId)
    }
    this.assertApprovalAllowed(run, request)

    const result = await this.reviews.createApproval({
      acknowledgedWarningIds: request.acknowledgedWarningIds,
      approvalId: randomUUID(),
      approvedByUserId: ownerId,
      approvedRevisionId: request.revisionId,
      checklist: request.checklist as unknown as Prisma.InputJsonValue,
      preflightRunId: request.preflightRunId,
      projectId,
      requestHash: createJsonHash(request),
    })
    if (result.kind === 'not_found') throw this.notFound()
    if (result.kind === 'revision_conflict') {
      throw this.revisionConflict(result.latestRevisionId)
    }
    if (result.kind === 'request_conflict') {
      throw this.revisionConflict(context.latestRevisionId)
    }
    const response = mapApproval(result.approval)
    this.validation.assertHttp('approval', response)

    return {
      statusCode: result.kind === 'created' ? 201 : 200,
      value: response,
    }
  }

  private assertApprovalAllowed(
    run: PreflightRunResponse,
    request: CreateApprovalRequest,
  ) {
    const warningIds = run.issues
      .filter(({ severity }) => severity === 'warning')
      .map(({ id }) => id)
    const acknowledged = new Set(request.acknowledgedWarningIds)
    const checklistComplete = Object.values(request.checklist).every(Boolean)
    const warningsMatch =
      warningIds.every((id) => acknowledged.has(id)) &&
      acknowledged.size === warningIds.length
    if (
      run.status !== 'succeeded' ||
      run.issues.some(({ severity }) => severity === 'blocking') ||
      !checklistComplete ||
      !warningsMatch
    ) {
      throw new ApiError({
        code: 'VALIDATION_FAILED',
        message:
          'Завершите проверку и подтвердите все предупреждения перед утверждением.',
        status: 422,
      })
    }
  }

  private notFound() {
    return new ApiError({
      code: 'RESOURCE_NOT_FOUND',
      message: 'Проект или результат проверки не найдены.',
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
