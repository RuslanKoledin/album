export const FUNNEL_EVENT_NAMES = [
  'landingViewed',
  'createStarted',
  'productSelected',
  'templateSelected',
  'authCompleted',
  'uploadStarted',
  'uploadCompleted',
  'editorOpened',
  'firstEditCompleted',
  'previewOpened',
  'projectApproved',
  'checkoutStarted',
  'orderCreated',
  'paymentConfirmed',
  'orderCompleted',
] as const

export type FunnelEventName = (typeof FUNNEL_EVENT_NAMES)[number]

interface FunnelEventPropertiesMap {
  readonly landingViewed: Record<string, never>
  readonly createStarted: Record<string, never>
  readonly productSelected: { readonly productId: string }
  readonly templateSelected: { readonly templateId: string }
  readonly authCompleted: Record<string, never>
  readonly uploadStarted: { readonly assetCount: number }
  readonly uploadCompleted: { readonly assetCount: number }
  readonly editorOpened: Record<string, never>
  readonly firstEditCompleted: Record<string, never>
  readonly previewOpened: Record<string, never>
  readonly projectApproved: { readonly revisionNumber: number }
  readonly checkoutStarted: Record<string, never>
  readonly orderCreated: {
    readonly deliveryMethod: 'pickup' | 'courier'
  }
  readonly paymentConfirmed: Record<string, never>
  readonly orderCompleted: { readonly status: 'completed' }
}

export interface FunnelEventContext {
  readonly anonymousSessionId: string | null
  readonly projectId: string | null
  readonly orderId: string | null
}

export type FunnelEvent<Name extends FunnelEventName = FunnelEventName> = {
  readonly schemaVersion: 1
  readonly eventId: string
  readonly eventName: Name
  readonly occurredAt: string
  readonly anonymousSessionId: string | null
  readonly projectId: string | null
  readonly orderId: string | null
  readonly properties: FunnelEventPropertiesMap[Name]
}

export type FunnelEventInput<Name extends FunnelEventName> = {
  readonly eventName: Name
  readonly context: FunnelEventContext
  readonly properties: FunnelEventPropertiesMap[Name]
}
