import { randomUUID } from 'node:crypto'

import { createJsonHash } from '@photobook/domain'

import { Prisma } from './generated/prisma/client.js'
import type { PhotobookPrismaClient } from './createPrismaClient.js'
import type { PhotobookTransactionClient } from './projectRevisionRepository.types.js'

export type IdempotencyResult<Value> =
  | { readonly kind: 'conflict' }
  | { readonly kind: 'created' | 'replayed'; readonly value: Value }

export class IdempotencyRepository {
  constructor(private readonly client: PhotobookPrismaClient) {}

  async execute<Value extends Prisma.InputJsonValue>(input: {
    readonly expiresAt: Date
    readonly key: string
    readonly operation: (
      transaction: PhotobookTransactionClient,
    ) => Promise<Value>
    readonly request: unknown
    readonly scope: string
    readonly statusCode: number
  }): Promise<IdempotencyResult<Value>> {
    const requestHash = createJsonHash(input.request)

    return this.client.$transaction(
      async (transaction) => {
        const lockKey = `${input.scope}:${input.key}`
        await transaction.$queryRaw`
          SELECT true AS locked
          FROM (
            SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))
          ) AS acquired_lock
        `
        const existing = await transaction.idempotencyRecord.findUnique({
          where: { scope_key: { key: input.key, scope: input.scope } },
        })
        if (existing && existing.expiresAt.getTime() > Date.now()) {
          return existing.requestHash === requestHash
            ? {
                kind: 'replayed' as const,
                value: existing.response as Value,
              }
            : { kind: 'conflict' as const }
        }
        if (existing) {
          await transaction.idempotencyRecord.delete({
            where: { id: existing.id },
          })
        }

        const value = await input.operation(transaction)
        await transaction.idempotencyRecord.create({
          data: {
            expiresAt: input.expiresAt,
            id: randomUUID(),
            key: input.key,
            requestHash,
            response: value,
            scope: input.scope,
            statusCode: input.statusCode,
          },
        })
        return { kind: 'created' as const, value }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  }
}
