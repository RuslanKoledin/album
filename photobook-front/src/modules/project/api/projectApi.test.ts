import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it } from 'vitest'

import { createMinimalBookDocumentV1Fixture } from '@mocks/book'
import { baseApi } from '@shared/api'

import { projectApi } from './projectApi'
import {
  DEMO_PROJECT_ID,
  MOCK_CSRF_TOKEN,
  createProjectRequestFixture,
} from '@mocks/project'

const createStore = () =>
  configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  })

describe('projectApi', () => {
  it('gets the seeded demo project through RTK Query', async () => {
    const store = createStore()

    const result = await store.dispatch(
      projectApi.endpoints.getProject.initiate(DEMO_PROJECT_ID),
    )

    expect(result.data?.project.id).toBe(DEMO_PROJECT_ID)
    expect(result.data?.latestRevision.document.schemaVersion).toBe(1)
  })

  it('creates a project and safely replays the same idempotency key', async () => {
    const store = createStore()
    const args = {
      body: createProjectRequestFixture,
      csrfToken: MOCK_CSRF_TOKEN,
      idempotencyKey: 'mock-idempotency-create-01',
    }

    const first = await store.dispatch(
      projectApi.endpoints.createProject.initiate(args),
    )
    const replay = await store.dispatch(
      projectApi.endpoints.createProject.initiate(args),
    )

    expect(first.data).toEqual(replay.data)
    expect(first.data?.project.id).toBe('mock-project-created-01')
    expect(first.data?.latestRevision.document.spreads).toHaveLength(
      createProjectRequestFixture.spreadCount,
    )
    expect(first.data?.latestRevision.document.assets).toHaveLength(4)
  })

  it('saves one revision and replays the same client mutation safely', async () => {
    const store = createStore()
    const project = await store
      .dispatch(projectApi.endpoints.getProject.initiate(DEMO_PROJECT_ID))
      .unwrap()
    const document = createMinimalBookDocumentV1Fixture()
    const args = {
      projectId: DEMO_PROJECT_ID,
      csrfToken: MOCK_CSRF_TOKEN,
      body: {
        baseRevisionId: project.latestRevision.id,
        clientMutationId: 'mock-mutation-save-01',
        document: {
          ...document,
          metadata: { title: 'Сохранённая семейная история' },
        },
      },
    }

    const first = await store.dispatch(
      projectApi.endpoints.saveProjectDocument.initiate(args),
    )
    const replay = await store.dispatch(
      projectApi.endpoints.saveProjectDocument.initiate(args),
    )

    expect(first.data).toEqual(replay.data)
    expect(first.data).toMatchObject({ revisionNumber: 2 })
  })

  it('returns the documented conflict for a stale base revision', async () => {
    const store = createStore()
    const document = createMinimalBookDocumentV1Fixture()

    const result = await store.dispatch(
      projectApi.endpoints.saveProjectDocument.initiate({
        projectId: DEMO_PROJECT_ID,
        csrfToken: MOCK_CSRF_TOKEN,
        body: {
          baseRevisionId: 'mock-revision-stale',
          clientMutationId: 'mock-mutation-stale-01',
          document,
        },
      }),
    )

    expect(result.error).toMatchObject({
      status: 409,
      data: {
        error: {
          code: 'PROJECT_REVISION_CONFLICT',
          details: { latestRevisionId: 'mock-revision-demo-01' },
        },
      },
    })
  })
})
