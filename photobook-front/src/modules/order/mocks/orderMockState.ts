import { getMockProject } from '@mocks/project'
import {
  getMockApprovalForRevision,
  getMockPreflightRun,
} from '@mocks/project-review'
import { readMockSessionState, writeMockSessionState } from '@mocks/storage'
import { getMockPriceQuoteRecord } from '@mocks/pricing'
import type { ProjectDetailDto } from '@modules/project'
import type { ApprovalDto, PreflightRunDto } from '@modules/project-review'

import type { CreateOrderRequestDto, OrderDto } from '@order/model'

interface ReplayRecord {
  readonly fingerprint: string
  readonly response: OrderDto
}

let orders = new Map<string, OrderDto>()
let orderContexts = new Map<string, MockOrderContext>()
let orderReplays = new Map<string, ReplayRecord>()

interface MockOrderContext {
  readonly project: ProjectDetailDto
  readonly approval: ApprovalDto
  readonly preflightRun: PreflightRunDto
}

interface OrderMockSnapshot {
  readonly orders: [string, OrderDto][]
  readonly contexts: [string, MockOrderContext][]
  readonly replays: [string, ReplayRecord][]
}

const ORDER_MOCK_STORAGE_KEY = 'photobook:mock:orders:v2'

const clone = <T>(value: T): T => structuredClone(value)

const isOrderMockSnapshot = (value: unknown): value is OrderMockSnapshot => {
  if (!value || typeof value !== 'object') return false
  const snapshot = value as Record<string, unknown>

  return (
    Array.isArray(snapshot.orders) &&
    Array.isArray(snapshot.contexts) &&
    Array.isArray(snapshot.replays)
  )
}

const persistOrderMockState = () => {
  writeMockSessionState(ORDER_MOCK_STORAGE_KEY, {
    orders: [...orders.entries()],
    contexts: [...orderContexts.entries()],
    replays: [...orderReplays.entries()],
  } satisfies OrderMockSnapshot)
}

const restoreOrderMockState = () => {
  const snapshot = readMockSessionState(ORDER_MOCK_STORAGE_KEY)
  if (!isOrderMockSnapshot(snapshot)) {
    resetOrderMockState()
    return
  }

  orders = new Map(snapshot.orders)
  orderContexts = new Map(snapshot.contexts)
  orderReplays = new Map(snapshot.replays)
}

export function resetOrderMockState() {
  orders = new Map()
  orderContexts = new Map()
  orderReplays = new Map()
  persistOrderMockState()
}

export function getMockOrder(orderId: string) {
  const order = orders.get(orderId)
  return order ? clone(order) : undefined
}

export function getMockOrders() {
  return clone(
    [...orders.values()].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt),
    ),
  )
}

export function getMockOrderContext(orderId: string) {
  const context = orderContexts.get(orderId)
  return context ? clone(context) : undefined
}

export function createMockOrder(
  request: CreateOrderRequestDto,
  idempotencyKey: string,
) {
  const requestFingerprint = JSON.stringify(request)
  const replay = orderReplays.get(idempotencyKey)
  if (replay) {
    return replay.fingerprint === requestFingerprint
      ? { kind: 'success' as const, value: clone(replay.response) }
      : { kind: 'key_reused' as const }
  }

  const project = getMockProject(request.projectId)
  if (!project) return { kind: 'not_found' as const }
  if (
    !project.project.approvedRevisionId ||
    project.project.approvedRevisionId !== project.latestRevision.id ||
    request.approvedRevisionId !== project.latestRevision.id
  ) {
    return { kind: 'approval_required' as const }
  }
  const approval = getMockApprovalForRevision(request.approvedRevisionId)
  const preflightRun = approval
    ? getMockPreflightRun(approval.preflightRunId)
    : undefined
  if (!approval || !preflightRun) {
    return { kind: 'approval_required' as const }
  }

  const quote = getMockPriceQuoteRecord(request.priceQuoteId)
  const selection = project.latestRevision.document.productSelection
  const quoteMatchesOrder =
    quote &&
    Date.parse(quote.response.expiresAt) > Date.now() &&
    quote.request.productId === selection.productId &&
    quote.request.productSpecId === selection.productSpecId &&
    quote.request.catalogVersion === selection.catalogVersion &&
    quote.request.spreadCount ===
      project.latestRevision.document.spreads.length &&
    quote.request.quantity === request.quantity &&
    quote.request.delivery.method === request.delivery.method &&
    quote.request.delivery.city === request.delivery.city &&
    JSON.stringify(quote.request.options) ===
      JSON.stringify(selection.optionSelections)
  if (!quote || !quoteMatchesOrder) {
    return { kind: 'price_quote_invalid' as const }
  }

  const sequence = orders.size + 1
  const id = `mock-order-${sequence.toString().padStart(2, '0')}`
  const response: OrderDto = {
    id,
    number: `MOCK-${sequence.toString().padStart(4, '0')}`,
    projectId: request.projectId,
    approvedRevisionId: request.approvedRevisionId,
    priceQuoteId: request.priceQuoteId,
    status: 'created',
    quantity: 1,
    contact: request.contact,
    delivery: request.delivery,
    customerComment: request.customerComment,
    price: {
      amountMinor: quote.response.total.amountMinor,
      currency: 'KGS',
      status: 'mock',
    },
    createdAt: '2026-07-22T07:00:00Z',
    estimatedReadyAt: null,
  }

  orders.set(id, response)
  orderContexts.set(id, { project, approval, preflightRun })
  orderReplays.set(idempotencyKey, {
    fingerprint: requestFingerprint,
    response,
  })
  persistOrderMockState()
  return { kind: 'success' as const, value: clone(response) }
}

restoreOrderMockState()
