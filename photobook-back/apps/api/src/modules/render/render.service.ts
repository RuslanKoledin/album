import { Inject, Injectable } from '@nestjs/common'

import { ApiError } from '@api/common/http/api-error.js'
import { ContractValidationService } from '@api/common/http/contract-validation.service.js'
import { DatabaseService } from '@api/modules/database/database.service.js'

import type { CreateRenderJobRequest } from './render.types.js'

@Injectable()
export class RenderService {
  constructor(
    @Inject(DatabaseService) private readonly database: DatabaseService,
    @Inject(ContractValidationService)
    private readonly validation: ContractValidationService,
  ) {}

  async create(
    projectId: string,
    body: unknown,
    idempotencyKey: string,
    ownerId: string,
  ): Promise<never> {
    this.validation.assertHttp('createRenderJobRequest', body)
    this.assertIdempotencyKey(idempotencyKey)
    const request = body as CreateRenderJobRequest
    const approval = await this.database.client.approval.findFirst({
      select: {
        approvedRevisionId: true,
        project: {
          select: { approvedRevisionId: true, latestRevisionId: true },
        },
      },
      where: {
        id: request.approvalId,
        projectId,
        project: { deletedAt: null, ownerId },
      },
    })
    if (!approval) throw this.notFound()
    if (
      approval.project.latestRevisionId !== approval.approvedRevisionId ||
      approval.project.approvedRevisionId !== approval.approvedRevisionId
    ) {
      throw new ApiError({
        code: 'APPROVAL_OUTDATED',
        details: { projectId },
        message: 'Утверждение не относится к текущей версии проекта.',
        status: 409,
      })
    }

    throw new ApiError({
      code: 'RENDER_PROFILE_UNAVAILABLE',
      details: { projectId },
      message: 'Для продукта ещё не утверждены параметры печатного PDF.',
      status: 422,
    })
  }

  async get(projectId: string, ownerId: string): Promise<never> {
    const project = await this.database.client.project.findFirst({
      select: { id: true },
      where: { deletedAt: null, id: projectId, ownerId },
    })
    if (!project) throw this.notFound()

    throw this.notFound()
  }

  private assertIdempotencyKey(value: string) {
    if (value && value.length <= 128) return

    throw new ApiError({
      code: 'VALIDATION_FAILED',
      fieldErrors: [
        {
          field: 'Idempotency-Key',
          message: 'Передайте ключ длиной от 1 до 128 символов.',
        },
      ],
      message: 'Не указан корректный ключ идемпотентности.',
      status: 422,
    })
  }

  private notFound() {
    return new ApiError({
      code: 'RESOURCE_NOT_FOUND',
      message: 'Проект или задание рендера не найдены.',
      status: 404,
    })
  }
}
