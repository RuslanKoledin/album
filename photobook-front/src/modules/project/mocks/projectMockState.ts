import type {
  CreateProjectRequestDto,
  ProjectDetailDto,
  SaveProjectDocumentRequestDto,
  SaveProjectDocumentResponseDto,
} from '@project/model'
import { readMockSessionState, writeMockSessionState } from '@mocks/storage'
import { createMockProjectDocument } from './createMockProjectDocument'
import {
  createDemoProjectDetail,
  getMockCoverPreviewUrl,
} from './projectFixtures'

interface ReplayRecord<TResponse> {
  readonly fingerprint: string
  readonly response: TResponse
}

let projects = new Map<string, ProjectDetailDto>()
let creationReplays = new Map<string, ReplayRecord<ProjectDetailDto>>()
let saveReplays = new Map<
  string,
  ReplayRecord<SaveProjectDocumentResponseDto>
>()

interface ProjectMockSnapshot {
  readonly projects: [string, ProjectDetailDto][]
  readonly creationReplays: [string, ReplayRecord<ProjectDetailDto>][]
  readonly saveReplays: [string, ReplayRecord<SaveProjectDocumentResponseDto>][]
}

const PROJECT_MOCK_STORAGE_KEY = 'photobook:mock:projects:v1'

const clone = <T>(value: T): T => structuredClone(value)
const fingerprint = (value: unknown) => JSON.stringify(value)

const isProjectMockSnapshot = (
  value: unknown,
): value is ProjectMockSnapshot => {
  if (!value || typeof value !== 'object') return false
  const snapshot = value as Record<string, unknown>

  return (
    Array.isArray(snapshot.projects) &&
    Array.isArray(snapshot.creationReplays) &&
    Array.isArray(snapshot.saveReplays)
  )
}

const persistProjectMockState = () => {
  writeMockSessionState(PROJECT_MOCK_STORAGE_KEY, {
    projects: [...projects.entries()],
    creationReplays: [...creationReplays.entries()],
    saveReplays: [...saveReplays.entries()],
  } satisfies ProjectMockSnapshot)
}

const restoreProjectMockState = () => {
  const snapshot = readMockSessionState(PROJECT_MOCK_STORAGE_KEY)
  if (!isProjectMockSnapshot(snapshot)) {
    resetProjectMockState()
    return
  }

  projects = new Map(snapshot.projects)
  creationReplays = new Map(snapshot.creationReplays)
  saveReplays = new Map(snapshot.saveReplays)
}

export function resetProjectMockState() {
  const demoProject = createDemoProjectDetail()
  projects = new Map([[demoProject.project.id, demoProject]])
  creationReplays = new Map()
  saveReplays = new Map()
  persistProjectMockState()
}

export function getMockProject(projectId: string) {
  const project = projects.get(projectId)
  return project ? clone(project) : undefined
}

export function getMockProjects() {
  return clone(
    [...projects.values()]
      .map(({ project }) => project)
      .filter(({ deletedAt }) => deletedAt === null)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
  )
}

export function approveMockProject(projectId: string, revisionId: string) {
  const project = projects.get(projectId)
  if (!project || project.latestRevision.id !== revisionId) return false

  projects.set(projectId, {
    ...project,
    project: {
      ...project.project,
      status: 'approved',
      approvedRevisionId: revisionId,
      updatedAt: '2026-07-22T06:01:00Z',
    },
  })
  persistProjectMockState()

  return true
}

export function createMockProject(
  request: CreateProjectRequestDto,
  idempotencyKey: string,
) {
  const requestFingerprint = fingerprint(request)
  const replay = creationReplays.get(idempotencyKey)

  if (replay) {
    return replay.fingerprint === requestFingerprint
      ? { kind: 'success' as const, value: clone(replay.response) }
      : { kind: 'key_reused' as const }
  }

  const sequence = creationReplays.size + 1
  const projectId = `mock-project-created-${sequence.toString().padStart(2, '0')}`
  const revisionId = `mock-revision-created-${sequence.toString().padStart(2, '0')}`
  const document = createMockProjectDocument(request)
  const response: ProjectDetailDto = {
    project: {
      id: projectId,
      ownerId: 'mock-user-01',
      title: document.metadata.title,
      status: 'editing',
      productId: request.productId,
      templateId: request.templateId,
      categoryTags: request.categoryTags,
      catalogVersion: request.catalogVersion,
      latestRevisionId: revisionId,
      approvedRevisionId: null,
      coverPreviewUrl: getMockCoverPreviewUrl(),
      createdAt: '2026-07-21T08:35:00Z',
      updatedAt: '2026-07-21T08:35:00Z',
      deletedAt: null,
    },
    latestRevision: {
      id: revisionId,
      projectId,
      revisionNumber: 1,
      document,
      documentHash: 'sha256:mock-document-created-v1',
      createdAt: '2026-07-21T08:35:00Z',
    },
  }

  projects.set(response.project.id, response)
  creationReplays.set(idempotencyKey, {
    fingerprint: requestFingerprint,
    response,
  })
  persistProjectMockState()

  return { kind: 'success' as const, value: clone(response) }
}

export function saveMockProjectDocument(
  projectId: string,
  request: SaveProjectDocumentRequestDto,
) {
  const project = projects.get(projectId)
  if (!project) return { kind: 'not_found' as const }

  const replayKey = `${projectId}:${request.clientMutationId}`
  const requestFingerprint = fingerprint(request)
  const replay = saveReplays.get(replayKey)

  if (replay) {
    return replay.fingerprint === requestFingerprint
      ? { kind: 'success' as const, value: clone(replay.response) }
      : { kind: 'mutation_reused' as const }
  }

  if (request.baseRevisionId !== project.latestRevision.id) {
    return {
      kind: 'revision_conflict' as const,
      latestRevisionId: project.latestRevision.id,
    }
  }

  const revisionNumber = project.latestRevision.revisionNumber + 1
  const revisionId = `mock-revision-${projectId}-${revisionNumber}`
  const savedAt = '2026-07-21T08:40:00Z'
  const documentHash = `sha256:mock-document-${projectId}-v${revisionNumber}`
  const response: SaveProjectDocumentResponseDto = {
    revisionId,
    revisionNumber,
    savedAt,
    documentHash,
  }

  projects.set(projectId, {
    project: {
      ...project.project,
      title: request.document.metadata.title,
      status: 'editing',
      latestRevisionId: revisionId,
      updatedAt: savedAt,
    },
    latestRevision: {
      id: revisionId,
      projectId,
      revisionNumber,
      document: request.document,
      documentHash,
      createdAt: savedAt,
    },
  })
  saveReplays.set(replayKey, {
    fingerprint: requestFingerprint,
    response,
  })
  persistProjectMockState()

  return { kind: 'success' as const, value: clone(response) }
}

restoreProjectMockState()
