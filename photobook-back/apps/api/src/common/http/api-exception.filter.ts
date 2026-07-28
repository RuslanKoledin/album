import {
  Catch,
  HttpException,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common'
import type { FastifyReply, FastifyRequest } from 'fastify'

import { ApiError } from './api-error.js'

interface ErrorDescriptor {
  readonly code:
    | 'ACCESS_DENIED'
    | 'AUTH_REQUIRED'
    | 'EXTERNAL_PROVIDER_UNAVAILABLE'
    | 'INTERNAL_ERROR'
    | 'RATE_LIMITED'
    | 'RESOURCE_NOT_FOUND'
    | 'VALIDATION_FAILED'
  readonly message: string
  readonly retryable: boolean
}

function describeError(status: number): ErrorDescriptor {
  if (status === 401) {
    return {
      code: 'AUTH_REQUIRED',
      message: 'Требуется авторизация.',
      retryable: false,
    }
  }
  if (status === 403) {
    return {
      code: 'ACCESS_DENIED',
      message: 'Недостаточно прав для выполнения операции.',
      retryable: false,
    }
  }
  if (status === 404) {
    return {
      code: 'RESOURCE_NOT_FOUND',
      message: 'Запрошенный ресурс не найден.',
      retryable: false,
    }
  }
  if (status === 429) {
    return {
      code: 'RATE_LIMITED',
      message: 'Слишком много запросов. Повторите попытку позже.',
      retryable: true,
    }
  }
  if (status === 502 || status === 503) {
    return {
      code: 'EXTERNAL_PROVIDER_UNAVAILABLE',
      message: 'Сервис временно недоступен.',
      retryable: true,
    }
  }
  if (status >= 500) {
    return {
      code: 'INTERNAL_ERROR',
      message: 'Не удалось выполнить запрос.',
      retryable: false,
    }
  }

  return {
    code: 'VALIDATION_FAILED',
    message: 'Запрос содержит недопустимые данные.',
    retryable: false,
  }
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp()
    const request = context.getRequest<FastifyRequest>()
    const reply = context.getResponse<FastifyReply>()
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500
    const apiError = exception instanceof ApiError ? exception : null
    const descriptor = apiError?.descriptor ?? describeError(status)

    if (status >= 500) {
      request.log.error(
        {
          exceptionName:
            exception instanceof Error ? exception.name : 'UnknownException',
        },
        'Request failed',
      )
    }

    if (apiError?.descriptor.retryAfterSeconds) {
      reply.header('retry-after', apiError.descriptor.retryAfterSeconds)
    }

    void reply.status(status).send({
      error: {
        code: descriptor.code,
        message: descriptor.message,
        retryable: descriptor.retryable ?? false,
        fieldErrors: (apiError?.descriptor.fieldErrors ?? []).map(
          (fieldError) => ({
            code: fieldError.code ?? descriptor.code,
            field: fieldError.field,
            message: fieldError.message,
          }),
        ),
        requestId: request.id,
        ...(apiError?.descriptor.details
          ? { details: apiError.descriptor.details }
          : {}),
      },
    })
  }
}
