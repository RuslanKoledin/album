import { randomInt, randomUUID } from 'node:crypto'

import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import type { FastifyInstance, LightMyRequestResponse } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { loadAppConfig } from '@photobook/config'
import {
  ContractValidator,
  readContractArtifactJson,
} from '@photobook/contracts'
import { createPrismaClient } from '@photobook/database'

import { createApiApplication } from './createApiApplication.js'
import { StorageService } from './modules/storage/storage.service.js'

const runHttpTests = process.env.RUN_HTTP_TESTS === 'true'
const config = loadAppConfig()
const validator = new ContractValidator()
const client = createPrismaClient(config.database.url)
const phone = `+996555${String(randomInt(0, 1_000_000)).padStart(6, '0')}`

interface ErrorBody {
  readonly error: {
    readonly code: string
    readonly details?: { readonly latestRevisionId?: string }
  }
}

interface ProjectDetailBody {
  readonly latestRevision: {
    readonly document: {
      readonly metadata: { title: string }
      readonly [key: string]: unknown
    }
    readonly id: string
  }
  readonly project: {
    readonly approvedRevisionId: string | null
    readonly id: string
    readonly status: string
  }
}

interface SaveDocumentBody {
  readonly revisionId: string
}

interface UploadBatchBody {
  readonly batchId: string
  readonly uploads: readonly UploadInstructionBody[]
}

interface UploadInstructionBody {
  readonly assetId: string
  readonly clientFileId: string
  readonly expiresAt: string
  readonly headers: { readonly 'Content-Type': string }
  readonly method: 'PUT'
  readonly uploadUrl: string
}

interface AssetBody {
  readonly assetId: string
  readonly pixelHeight: number | null
  readonly pixelWidth: number | null
  readonly status: string
  readonly thumbnailUrl: string | null
}

interface PreflightRunBody {
  readonly id: string
  readonly issues: readonly {
    readonly code: string
    readonly elementId: string | null
    readonly id: string
    readonly severity: 'blocking' | 'info' | 'warning'
    readonly surfaceId: string
  }[]
  readonly revisionId: string
  readonly status: string
}

interface ApprovalBody {
  readonly approvedRevisionId: string
  readonly id: string
  readonly preflightRunId: string
}

function parseBody<Value = unknown>(response: LightMyRequestResponse): Value {
  return JSON.parse(response.body) as Value
}

describe.runIf(runHttpTests)('Photobook API B2-B4 flow', () => {
  let app: NestFastifyApplication
  let server: FastifyInstance
  let storage: StorageService
  let cookie: string
  let csrfToken: string

  beforeAll(async () => {
    app = await createApiApplication(config)
    await app.init()
    server = app.getHttpAdapter().getInstance()
    storage = app.get(StorageService)
  })

  afterAll(async () => {
    const user = await client.user.findUnique({ where: { phone } })
    if (user) {
      const assets = await client.asset.findMany({
        select: { objectKey: true },
        where: { project: { ownerId: user.id } },
      })
      await Promise.all(
        assets.map((asset) => storage.deleteObject(asset.objectKey)),
      )
      await client.idempotencyRecord.deleteMany({
        where: {
          OR: [
            { scope: `project:create:${user.id}` },
            { scope: { startsWith: `upload-batch:create:${user.id}:` } },
          ],
        },
      })
      await client.project.updateMany({
        data: { approvedRevisionId: null, latestRevisionId: null },
        where: { ownerId: user.id },
      })
      await client.project.deleteMany({ where: { ownerId: user.id } })
      await client.user.delete({ where: { id: user.id } })
    }
    await client.authChallenge.deleteMany({ where: { contact: phone } })
    await client.$disconnect()
    await app.close()
  })

  it('authenticates, creates, loads and safely autosaves a project', async () => {
    const catalogResponse = await server.inject({
      method: 'GET',
      url: '/api/v1/catalog/versions/mock-catalog-v0',
    })
    expect(catalogResponse.statusCode).toBe(200)
    expect(
      validator.validateHttp(
        'catalogVersionResponse',
        parseBody(catalogResponse),
      ),
    ).toEqual({ ok: true })
    const priceResponse = await server.inject({
      method: 'POST',
      payload: readContractArtifactJson(
        'examples/pricing/price-quote-request.json',
      ) as Record<string, unknown>,
      url: '/api/v1/price-quotes',
    })
    expect(priceResponse.statusCode).toBe(201)
    expect(
      validator.validateHttp('priceQuote', parseBody(priceResponse)),
    ).toEqual({ ok: true })

    const anonymousResponse = await server.inject({
      method: 'GET',
      url: '/api/v1/auth/session',
    })
    expect(parseBody(anonymousResponse)).toEqual({
      authenticated: false,
      csrfToken: null,
      user: null,
    })

    const challengeResponse = await server.inject({
      method: 'POST',
      payload: { channel: 'phone', contact: phone, locale: 'ru' },
      url: '/api/v1/auth/challenges',
    })
    expect(challengeResponse.statusCode).toBe(201)
    const challenge = parseBody<{ readonly challengeId: string }>(
      challengeResponse,
    )

    const invalidCodeResponse = await server.inject({
      method: 'POST',
      payload: { code: '111111' },
      url: `/api/v1/auth/challenges/${challenge.challengeId}/verify`,
    })
    expect(invalidCodeResponse.statusCode).toBe(401)
    expect(parseBody<ErrorBody>(invalidCodeResponse).error.code).toBe(
      'AUTH_CODE_INVALID',
    )

    const verificationResponse = await server.inject({
      method: 'POST',
      payload: { code: config.auth.fakeOtpCode },
      url: `/api/v1/auth/challenges/${challenge.challengeId}/verify`,
    })
    expect(verificationResponse.statusCode).toBe(200)
    const verification = parseBody<{ readonly csrfToken: string }>(
      verificationResponse,
    )
    csrfToken = verification.csrfToken
    const setCookie = verificationResponse.headers['set-cookie']
    cookie = String(Array.isArray(setCookie) ? setCookie[0] : setCookie).split(
      ';',
    )[0]!

    const createRequest = readContractArtifactJson(
      'examples/projects/create-project-request.json',
    ) as Record<string, unknown>
    const idempotencyKey = randomUUID()
    const createResponse = await server.inject({
      headers: {
        cookie,
        'idempotency-key': idempotencyKey,
        'x-csrf-token': csrfToken,
      },
      method: 'POST',
      payload: createRequest,
      url: '/api/v1/projects',
    })
    expect(createResponse.statusCode, createResponse.body).toBe(201)
    const projectDetail = parseBody<ProjectDetailBody>(createResponse)
    expect(validator.validateHttp('projectDetail', projectDetail)).toEqual({
      ok: true,
    })
    const projectListResponse = await server.inject({
      headers: { cookie },
      method: 'GET',
      url: '/api/v1/projects',
    })
    expect(projectListResponse.statusCode).toBe(200)
    expect(
      validator.validateHttp('projectList', parseBody(projectListResponse)),
    ).toEqual({ ok: true })

    const replayResponse = await server.inject({
      headers: {
        cookie,
        'idempotency-key': idempotencyKey,
        'x-csrf-token': csrfToken,
      },
      method: 'POST',
      payload: createRequest,
      url: '/api/v1/projects',
    })
    expect(parseBody(replayResponse)).toEqual(projectDetail)

    const conflictResponse = await server.inject({
      headers: {
        cookie,
        'idempotency-key': idempotencyKey,
        'x-csrf-token': csrfToken,
      },
      method: 'POST',
      payload: { ...createRequest, spreadCount: 2 },
      url: '/api/v1/projects',
    })
    expect(conflictResponse.statusCode).toBe(409)
    expect(parseBody<ErrorBody>(conflictResponse).error.code).toBe(
      'IDEMPOTENCY_KEY_REUSED',
    )

    const projectId = projectDetail.project.id
    const loadResponse = await server.inject({
      headers: { cookie },
      method: 'GET',
      url: `/api/v1/projects/${projectId}`,
    })
    expect(parseBody(loadResponse)).toEqual(projectDetail)

    const image = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64',
    )
    const clientFileId = randomUUID()
    const uploadRequest = {
      files: [
        {
          capturedAt: null,
          clientFileId,
          fileName: 'integration.png',
          mediaType: 'image/png',
          sizeBytes: image.byteLength,
        },
      ],
    }
    const uploadKey = randomUUID()
    const uploadBatchResponse = await server.inject({
      headers: {
        cookie,
        'idempotency-key': uploadKey,
        'x-csrf-token': csrfToken,
      },
      method: 'POST',
      payload: uploadRequest,
      url: `/api/v1/projects/${projectId}/upload-batches`,
    })
    expect(uploadBatchResponse.statusCode, uploadBatchResponse.body).toBe(201)
    const uploadBatch = parseBody<UploadBatchBody>(uploadBatchResponse)
    expect(
      validator.validateHttp('createUploadBatchResponse', uploadBatch),
    ).toEqual({ ok: true })
    const uploadReplayResponse = await server.inject({
      headers: {
        cookie,
        'idempotency-key': uploadKey,
        'x-csrf-token': csrfToken,
      },
      method: 'POST',
      payload: uploadRequest,
      url: `/api/v1/projects/${projectId}/upload-batches`,
    })
    expect(parseBody(uploadReplayResponse)).toEqual(uploadBatch)
    const uploadConflictResponse = await server.inject({
      headers: {
        cookie,
        'idempotency-key': uploadKey,
        'x-csrf-token': csrfToken,
      },
      method: 'POST',
      payload: {
        files: [{ ...uploadRequest.files[0], fileName: 'different.png' }],
      },
      url: `/api/v1/projects/${projectId}/upload-batches`,
    })
    expect(uploadConflictResponse.statusCode).toBe(409)
    expect(parseBody<ErrorBody>(uploadConflictResponse).error.code).toBe(
      'IDEMPOTENCY_KEY_REUSED',
    )

    const instruction = uploadBatch.uploads[0]!
    await new Promise((resolve) => setTimeout(resolve, 2_100))
    const expiredUploadResponse = await fetch(instruction.uploadUrl, {
      body: image,
      headers: instruction.headers,
      method: instruction.method,
    })
    expect(expiredUploadResponse.status).toBe(403)

    const renewResponse = await server.inject({
      headers: { cookie, 'x-csrf-token': csrfToken },
      method: 'POST',
      url: `/api/v1/projects/${projectId}/assets/${instruction.assetId}/renew-upload`,
    })
    expect(renewResponse.statusCode, renewResponse.body).toBe(200)
    const renewed = parseBody<UploadInstructionBody>(renewResponse)
    expect(validator.validateHttp('uploadInstruction', renewed)).toEqual({
      ok: true,
    })
    expect(renewed).toMatchObject({
      assetId: instruction.assetId,
      clientFileId,
      method: 'PUT',
    })
    const objectUploadResponse = await fetch(renewed.uploadUrl, {
      body: image,
      headers: renewed.headers,
      method: renewed.method,
    })
    expect(objectUploadResponse.status).toBe(200)
    const etag = objectUploadResponse.headers.get('etag')
    expect(etag).toBeTruthy()

    const completionRequest = {
      etag,
      sha256: null,
      sizeBytes: image.byteLength,
    }
    const mismatchResponse = await server.inject({
      headers: { cookie, 'x-csrf-token': csrfToken },
      method: 'POST',
      payload: { ...completionRequest, sizeBytes: image.byteLength + 1 },
      url: `/api/v1/projects/${projectId}/assets/${instruction.assetId}/complete`,
    })
    expect(mismatchResponse.statusCode).toBe(422)
    const completionResponse = await server.inject({
      headers: { cookie, 'x-csrf-token': csrfToken },
      method: 'POST',
      payload: completionRequest,
      url: `/api/v1/projects/${projectId}/assets/${instruction.assetId}/complete`,
    })
    expect(completionResponse.statusCode, completionResponse.body).toBe(200)
    const completedAsset = parseBody<AssetBody>(completionResponse)
    expect(validator.validateHttp('asset', completedAsset)).toEqual({
      ok: true,
    })
    expect(completedAsset).toMatchObject({
      assetId: instruction.assetId,
      pixelHeight: 1,
      pixelWidth: 1,
      status: 'ready',
    })
    expect(completedAsset.thumbnailUrl).toBeTruthy()

    const completionReplayResponse = await server.inject({
      headers: { cookie, 'x-csrf-token': csrfToken },
      method: 'POST',
      payload: completionRequest,
      url: `/api/v1/projects/${projectId}/assets/${instruction.assetId}/complete`,
    })
    expect(completionReplayResponse.statusCode).toBe(200)
    expect(parseBody<AssetBody>(completionReplayResponse)).toMatchObject({
      assetId: instruction.assetId,
      pixelHeight: 1,
      pixelWidth: 1,
      status: 'ready',
    })

    const assetListResponse = await server.inject({
      headers: { cookie },
      method: 'GET',
      url: `/api/v1/projects/${projectId}/assets`,
    })
    expect(assetListResponse.statusCode).toBe(200)
    expect(
      validator.validateHttp('assetList', parseBody(assetListResponse)),
    ).toEqual({ ok: true })
    const previewResponse = await fetch(completedAsset.thumbnailUrl!)
    expect(previewResponse.status).toBe(200)
    expect(Buffer.from(await previewResponse.arrayBuffer())).toEqual(image)

    const completedRenewResponse = await server.inject({
      headers: { cookie, 'x-csrf-token': csrfToken },
      method: 'POST',
      url: `/api/v1/projects/${projectId}/assets/${instruction.assetId}/renew-upload`,
    })
    expect(completedRenewResponse.statusCode).toBe(409)
    expect(parseBody<ErrorBody>(completedRenewResponse).error.code).toBe(
      'ASSET_UPLOAD_INCOMPLETE',
    )

    const changedDocument = structuredClone(
      projectDetail.latestRevision.document,
    ) as {
      metadata: { title: string }
      [key: string]: unknown
    }
    changedDocument.metadata.title = 'Семейная история — обновлено'
    changedDocument.assets = [{ assetId: instruction.assetId }]
    const changedBook = changedDocument as unknown as {
      cover: { photoSlots: { assetId: string | null }[] }
      spreads: { photoSlots: { assetId: string | null }[] }[]
    }
    changedBook.cover.photoSlots.forEach((slot) => {
      slot.assetId = instruction.assetId
    })
    changedBook.spreads.forEach((spread) =>
      spread.photoSlots.forEach((slot) => {
        slot.assetId = instruction.assetId
      }),
    )
    const autosaveRequest = {
      baseRevisionId: projectDetail.latestRevision.id,
      clientMutationId: randomUUID(),
      document: changedDocument,
    }
    const invalidAssetResponse = await server.inject({
      headers: { cookie, 'x-csrf-token': csrfToken },
      method: 'PUT',
      payload: {
        ...autosaveRequest,
        clientMutationId: randomUUID(),
        document: {
          ...changedDocument,
          assets: [{ assetId: randomUUID() }],
        },
      },
      url: `/api/v1/projects/${projectId}/document`,
    })
    expect(invalidAssetResponse.statusCode).toBe(422)
    expect(parseBody<ErrorBody>(invalidAssetResponse).error.code).toBe(
      'VALIDATION_FAILED',
    )
    const saveResponse = await server.inject({
      headers: { cookie, 'x-csrf-token': csrfToken },
      method: 'PUT',
      payload: autosaveRequest,
      url: `/api/v1/projects/${projectId}/document`,
    })
    expect(saveResponse.statusCode).toBe(200)
    const saved = parseBody<SaveDocumentBody>(saveResponse)
    expect(
      validator.validateHttp('saveProjectDocumentResponse', saved),
    ).toEqual({ ok: true })

    const saveReplay = await server.inject({
      headers: { cookie, 'x-csrf-token': csrfToken },
      method: 'PUT',
      payload: autosaveRequest,
      url: `/api/v1/projects/${projectId}/document`,
    })
    expect(parseBody(saveReplay)).toEqual(saved)

    const staleResponse = await server.inject({
      headers: { cookie, 'x-csrf-token': csrfToken },
      method: 'PUT',
      payload: { ...autosaveRequest, clientMutationId: randomUUID() },
      url: `/api/v1/projects/${projectId}/document`,
    })
    expect(staleResponse.statusCode).toBe(409)
    expect(parseBody<ErrorBody>(staleResponse).error).toMatchObject({
      code: 'PROJECT_REVISION_CONFLICT',
      details: { latestRevisionId: saved.revisionId },
    })

    const stalePreflightResponse = await server.inject({
      headers: { cookie, 'x-csrf-token': csrfToken },
      method: 'POST',
      payload: { revisionId: projectDetail.latestRevision.id },
      url: `/api/v1/projects/${projectId}/preflight-runs`,
    })
    expect(stalePreflightResponse.statusCode).toBe(409)

    const preflightResponse = await server.inject({
      headers: { cookie, 'x-csrf-token': csrfToken },
      method: 'POST',
      payload: { revisionId: saved.revisionId },
      url: `/api/v1/projects/${projectId}/preflight-runs`,
    })
    expect(preflightResponse.statusCode, preflightResponse.body).toBe(201)
    const preflight = parseBody<PreflightRunBody>(preflightResponse)
    expect(validator.validateHttp('preflightRun', preflight)).toEqual({
      ok: true,
    })
    expect(preflight).toMatchObject({
      revisionId: saved.revisionId,
      status: 'succeeded',
    })
    expect(
      preflight.issues.every(({ severity }) => severity === 'warning'),
    ).toBe(true)
    expect(preflight.issues.length).toBeGreaterThan(0)

    const checklist = {
      captionsChecked: true,
      cropUnderstood: true,
      datesChecked: true,
      namesChecked: true,
      pageOrderChecked: true,
      readyForPrint: true,
    }
    const approvalRequest = {
      acknowledgedWarningIds: preflight.issues.map(({ id }) => id),
      checklist,
      preflightRunId: preflight.id,
      revisionId: saved.revisionId,
    }
    const incompleteApprovalResponse = await server.inject({
      headers: { cookie, 'x-csrf-token': csrfToken },
      method: 'POST',
      payload: {
        ...approvalRequest,
        checklist: { ...checklist, readyForPrint: false },
      },
      url: `/api/v1/projects/${projectId}/approvals`,
    })
    expect(incompleteApprovalResponse.statusCode).toBe(422)
    const unacknowledgedWarningResponse = await server.inject({
      headers: { cookie, 'x-csrf-token': csrfToken },
      method: 'POST',
      payload: { ...approvalRequest, acknowledgedWarningIds: [] },
      url: `/api/v1/projects/${projectId}/approvals`,
    })
    expect(unacknowledgedWarningResponse.statusCode).toBe(422)

    const approvalResponse = await server.inject({
      headers: { cookie, 'x-csrf-token': csrfToken },
      method: 'POST',
      payload: approvalRequest,
      url: `/api/v1/projects/${projectId}/approvals`,
    })
    expect(approvalResponse.statusCode, approvalResponse.body).toBe(201)
    const approval = parseBody<ApprovalBody>(approvalResponse)
    expect(validator.validateHttp('approval', approval)).toEqual({ ok: true })
    expect(approval).toMatchObject({
      approvedRevisionId: saved.revisionId,
      preflightRunId: preflight.id,
    })
    const approvalReplayResponse = await server.inject({
      headers: { cookie, 'x-csrf-token': csrfToken },
      method: 'POST',
      payload: approvalRequest,
      url: `/api/v1/projects/${projectId}/approvals`,
    })
    expect(approvalReplayResponse.statusCode).toBe(200)
    expect(parseBody(approvalReplayResponse)).toEqual(approval)
    const renderIdempotencyKey = randomUUID()
    const renderRequest = {
      approvalId: approval.id,
      retryOfRenderJobId: null,
      type: 'print_pdf',
    }
    const unauthenticatedRenderResponse = await server.inject({
      headers: { 'idempotency-key': randomUUID() },
      method: 'POST',
      payload: renderRequest,
      url: `/api/v1/projects/${projectId}/render-jobs`,
    })
    expect(unauthenticatedRenderResponse.statusCode).toBe(401)
    expect(parseBody<ErrorBody>(unauthenticatedRenderResponse).error.code).toBe(
      'AUTH_REQUIRED',
    )
    const unavailableRenderResponse = await server.inject({
      headers: {
        cookie,
        'idempotency-key': renderIdempotencyKey,
        'x-csrf-token': csrfToken,
      },
      method: 'POST',
      payload: renderRequest,
      url: `/api/v1/projects/${projectId}/render-jobs`,
    })
    expect(
      unavailableRenderResponse.statusCode,
      unavailableRenderResponse.body,
    ).toBe(422)
    expect(parseBody<ErrorBody>(unavailableRenderResponse).error.code).toBe(
      'RENDER_PROFILE_UNAVAILABLE',
    )
    expect(
      await client.idempotencyRecord.count({
        where: { key: renderIdempotencyKey },
      }),
    ).toBe(0)
    const missingRenderResponse = await server.inject({
      headers: { cookie },
      method: 'GET',
      url: `/api/v1/projects/${projectId}/render-jobs/${randomUUID()}`,
    })
    expect(missingRenderResponse.statusCode).toBe(404)
    const repeatedPreflightResponse = await server.inject({
      headers: { cookie, 'x-csrf-token': csrfToken },
      method: 'POST',
      payload: { revisionId: saved.revisionId },
      url: `/api/v1/projects/${projectId}/preflight-runs`,
    })
    expect(repeatedPreflightResponse.statusCode).toBe(201)
    const approvedProjectResponse = await server.inject({
      headers: { cookie },
      method: 'GET',
      url: `/api/v1/projects/${projectId}`,
    })
    expect(
      parseBody<ProjectDetailBody>(approvedProjectResponse).project,
    ).toMatchObject({
      approvedRevisionId: saved.revisionId,
      status: 'approved',
    })

    const laterDocument = structuredClone(changedDocument)
    laterDocument.metadata.title = 'Семейная история — после утверждения'
    const laterBook = laterDocument as unknown as {
      spreads: {
        id: string
        photoSlots: {
          crop: { height: number; width: number; x: number; y: number }
          id: string
        }[]
      }[]
    }
    const invalidSpread = laterBook.spreads[0]
    const invalidSlot = invalidSpread?.photoSlots[0]
    if (!invalidSpread || !invalidSlot) {
      throw new Error(
        'Expected the integration book fixture to have a photo slot',
      )
    }
    invalidSlot.crop = { height: 1, width: 0.6, x: 0.5, y: 0 }
    const laterSaveResponse = await server.inject({
      headers: { cookie, 'x-csrf-token': csrfToken },
      method: 'PUT',
      payload: {
        baseRevisionId: saved.revisionId,
        clientMutationId: randomUUID(),
        document: laterDocument,
      },
      url: `/api/v1/projects/${projectId}/document`,
    })
    expect(laterSaveResponse.statusCode).toBe(200)
    const laterSave = parseBody<SaveDocumentBody>(laterSaveResponse)
    const changedProjectResponse = await server.inject({
      headers: { cookie },
      method: 'GET',
      url: `/api/v1/projects/${projectId}`,
    })
    expect(parseBody<ProjectDetailBody>(changedProjectResponse)).toMatchObject({
      latestRevision: { id: laterSave.revisionId },
      project: { approvedRevisionId: saved.revisionId },
    })
    const outdatedRenderResponse = await server.inject({
      headers: {
        cookie,
        'idempotency-key': randomUUID(),
        'x-csrf-token': csrfToken,
      },
      method: 'POST',
      payload: renderRequest,
      url: `/api/v1/projects/${projectId}/render-jobs`,
    })
    expect(outdatedRenderResponse.statusCode).toBe(409)
    expect(parseBody<ErrorBody>(outdatedRenderResponse).error.code).toBe(
      'APPROVAL_OUTDATED',
    )
    const changedPreflightResponse = await server.inject({
      headers: { cookie, 'x-csrf-token': csrfToken },
      method: 'POST',
      payload: { revisionId: laterSave.revisionId },
      url: `/api/v1/projects/${projectId}/preflight-runs`,
    })
    expect(
      changedPreflightResponse.statusCode,
      changedPreflightResponse.body,
    ).toBe(201)
    const changedPreflight = parseBody<PreflightRunBody>(
      changedPreflightResponse,
    )
    expect(changedPreflight.issues).toContainEqual(
      expect.objectContaining({
        code: 'CROP_OUT_OF_BOUNDS',
        elementId: invalidSlot.id,
        severity: 'blocking',
        surfaceId: invalidSpread.id,
      }),
    )
    const staleApprovalResponse = await server.inject({
      headers: { cookie, 'x-csrf-token': csrfToken },
      method: 'POST',
      payload: approvalRequest,
      url: `/api/v1/projects/${projectId}/approvals`,
    })
    expect(staleApprovalResponse.statusCode).toBe(409)
    expect(parseBody<ErrorBody>(staleApprovalResponse).error).toMatchObject({
      code: 'PROJECT_REVISION_CONFLICT',
      details: { latestRevisionId: laterSave.revisionId },
    })

    const authenticatedUser = await client.user.findUniqueOrThrow({
      where: { phone },
    })
    await client.session.updateMany({
      data: { expiresAt: new Date(Date.now() - 1_000) },
      where: { invalidatedAt: null, userId: authenticatedUser.id },
    })
    const expiredSessionResponse = await server.inject({
      headers: { cookie },
      method: 'GET',
      url: '/api/v1/projects',
    })
    expect(expiredSessionResponse.statusCode).toBe(401)
    expect(parseBody<ErrorBody>(expiredSessionResponse).error.code).toBe(
      'SESSION_EXPIRED',
    )
    expect(
      parseBody(
        await server.inject({
          headers: { cookie },
          method: 'GET',
          url: '/api/v1/auth/session',
        }),
      ),
    ).toEqual({
      authenticated: false,
      csrfToken: null,
      user: null,
    })
  })
})
