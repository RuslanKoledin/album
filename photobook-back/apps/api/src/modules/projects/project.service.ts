import { randomUUID } from 'node:crypto'
import { Inject, Injectable } from '@nestjs/common'

import {
  IdempotencyRepository,
  ProjectRevisionRepository,
} from '@photobook/database'
import type { Prisma } from '@photobook/database'

import { ApiError } from '@api/common/http/api-error.js'
import { ContractValidationService } from '@api/common/http/contract-validation.service.js'
import { DatabaseService } from '@api/modules/database/database.service.js'

import { resolveProjectConfiguration } from './project-catalog-policy.js'
import { createInitialProjectDocument } from './project-document.factory.js'
import { mapProject, mapProjectDetail } from './project.mapper.js'
import type {
  CreateProjectRequest,
  SaveProjectDocumentRequest,
} from './project.types.js'

const IDEMPOTENCY_TTL_MILLISECONDS = 24 * 60 * 60 * 1_000

@Injectable()
export class ProjectService {
  private readonly idempotency: IdempotencyRepository
  private readonly revisions: ProjectRevisionRepository

  constructor(
    @Inject(DatabaseService) private readonly database: DatabaseService,
    @Inject(ContractValidationService)
    private readonly validation: ContractValidationService,
  ) {
    this.idempotency = new IdempotencyRepository(this.database.client)
    this.revisions = new ProjectRevisionRepository(this.database.client)
  }

  async create(body: unknown, idempotencyKey: string, ownerId: string) {
    this.validation.assertHttp('createProjectRequest', body)
    this.assertIdempotencyKey(idempotencyKey)
    const request = body as CreateProjectRequest
    const catalog = await this.getCatalog(request.catalogVersion)
    const configuration = resolveProjectConfiguration(catalog, request)
    const document = createInitialProjectDocument(request, configuration)
    this.validation.assertBookDocument(document)

    const result = await this.idempotency.execute({
      expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_MILLISECONDS),
      key: idempotencyKey,
      operation: async (transaction) => {
        const created = await this.revisions.createWithInitialRevision(
          {
            catalogVersionId: request.catalogVersion,
            categoryTags: request.categoryTags,
            document: document as unknown as Prisma.InputJsonValue,
            ownerId,
            productId: request.productId,
            projectId: randomUUID(),
            revisionId: randomUUID(),
            templateId: request.templateId,
            title: document.metadata.title,
          },
          transaction,
        )
        return mapProjectDetail(
          created.project,
          created.revision,
        ) as Prisma.InputJsonValue
      },
      request,
      scope: `project:create:${ownerId}`,
      statusCode: 201,
    })
    if (result.kind === 'conflict') {
      throw new ApiError({
        code: 'IDEMPOTENCY_KEY_REUSED',
        message: 'Этот ключ уже использован с другими данными.',
        status: 409,
      })
    }
    this.validation.assertHttp('projectDetail', result.value)

    return result.value
  }

  async get(projectId: string, ownerId: string) {
    const record = await this.revisions.findOwnedProject(projectId, ownerId)
    if (!record?.latestRevision) throw this.projectNotFound()
    const response = mapProjectDetail(record, record.latestRevision)
    this.validation.assertHttp('projectDetail', response)

    return response
  }

  async list(ownerId: string) {
    const projects = await this.revisions.findOwnedProjects(ownerId)
    const response = {
      items: projects.map(mapProject),
      pageInfo: { hasNextPage: false, nextCursor: null },
    }
    this.validation.assertHttp('projectList', response)

    return response
  }

  async saveDocument(projectId: string, body: unknown, ownerId: string) {
    this.validation.assertHttp('saveProjectDocumentRequest', body)
    const request = body as SaveProjectDocumentRequest
    const project = await this.revisions.findOwnedProject(projectId, ownerId)
    if (!project?.latestRevision) throw this.projectNotFound()
    this.assertDocumentMatchesProject(request.document, project)
    await this.assertDocumentAssetsBelongToProject(request.document, projectId)

    const result = await this.revisions.saveRevision({
      baseRevisionId: request.baseRevisionId,
      clientMutationId: request.clientMutationId,
      document: request.document as Prisma.InputJsonValue,
      ownerId,
      projectId,
      revisionId: randomUUID(),
    })
    if (result.kind === 'project_not_found') throw this.projectNotFound()
    if (result.kind === 'mutation_conflict') {
      throw new ApiError({
        code: 'CLIENT_MUTATION_ID_REUSED',
        message: 'Идентификатор сохранения уже использован с другими данными.',
        status: 409,
      })
    }
    if (result.kind === 'revision_conflict') {
      throw new ApiError({
        code: 'PROJECT_REVISION_CONFLICT',
        details: { latestRevisionId: result.latestRevisionId },
        message: 'Проект был изменён в другом окне.',
        status: 409,
      })
    }
    const response = {
      documentHash: result.revision.documentHash,
      revisionId: result.revision.id,
      revisionNumber: result.revision.revisionNumber,
      savedAt: result.revision.createdAt.toISOString(),
    }
    this.validation.assertHttp('saveProjectDocumentResponse', response)

    return response
  }

  private assertDocumentMatchesProject(
    document: unknown,
    project: {
      readonly catalogVersionId: string
      readonly productId: string
      readonly templateId: string
    },
  ) {
    const selection = (
      document as {
        readonly productSelection?: {
          readonly catalogVersion?: string
          readonly productId?: string
          readonly templateId?: string
        }
      }
    ).productSelection
    if (
      selection?.catalogVersion !== project.catalogVersionId ||
      selection.productId !== project.productId ||
      selection.templateId !== project.templateId
    ) {
      throw new ApiError({
        code: 'VALIDATION_FAILED',
        fieldErrors: [
          {
            field: '/document/productSelection',
            message: 'Конфигурация документа не совпадает с проектом.',
          },
        ],
        message: 'Документ не соответствует конфигурации проекта.',
        status: 422,
      })
    }
  }

  private async assertDocumentAssetsBelongToProject(
    document: unknown,
    projectId: string,
  ) {
    const referencedIds = (
      document as {
        readonly assets?: readonly { readonly assetId?: string }[]
      }
    ).assets?.flatMap(({ assetId }) =>
      assetId && !assetId.startsWith('mock-') ? [assetId] : [],
    )
    if (!referencedIds?.length) return

    const ownedAssets = await this.database.client.asset.count({
      where: {
        deletedAt: null,
        id: { in: [...new Set(referencedIds)] },
        projectId,
        status: { in: ['UPLOADED', 'PROCESSING', 'READY'] },
      },
    })
    if (ownedAssets !== new Set(referencedIds).size) {
      throw new ApiError({
        code: 'VALIDATION_FAILED',
        fieldErrors: [
          {
            code: 'ASSET_REFERENCE_INVALID',
            field: '/document/assets',
            message:
              'Документ содержит недоступную или незагруженную фотографию.',
          },
        ],
        message: 'Некоторые фотографии недоступны в этом проекте.',
        status: 422,
      })
    }
  }

  private assertIdempotencyKey(value: string) {
    if (!value || value.length > 128) {
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
  }

  private async getCatalog(catalogVersion: string) {
    const catalog = await this.database.client.catalogVersion.findUnique({
      where: { id: catalogVersion },
    })
    if (!catalog?.publishedAt) {
      throw new ApiError({
        code: 'VALIDATION_FAILED',
        fieldErrors: [
          { field: '/catalogVersion', message: 'Версия каталога недоступна.' },
        ],
        message: 'Выбранная версия каталога недоступна.',
        status: 422,
      })
    }
    this.validation.assertHttp('catalogVersionResponse', catalog.payload)

    return catalog.payload
  }

  private projectNotFound() {
    return new ApiError({
      code: 'RESOURCE_NOT_FOUND',
      message: 'Проект не найден.',
      status: 404,
    })
  }
}
