# Provisional B0: backend stack и инфраструктурные границы

> Статус: `PROVISIONAL_ACCEPTED` для scaffold и оценки  
> Принято: 22 июля 2026 года  
> Требует ratification назначенного Backend owner до `BACKEND_READY`

Решение оптимизирует небольшой MVP под TypeScript-команду и существующий
contract-first frontend. Оно не выбирает production hosting, SMS, банк или
регион хранения данных.

## Выбранный стек

| Область            | Решение                                              | Причина                                                          |
| ------------------ | ---------------------------------------------------- | ---------------------------------------------------------------- |
| Runtime            | Node.js 24 LTS, ESM, strict TypeScript               | LTS-линия; единый язык frontend/backend                          |
| HTTP API           | NestJS 11 + Fastify adapter                          | Модульность, guards/interceptors, OpenAPI и быстрый HTTP adapter |
| API style          | REST `/api/v1`, OpenAPI 3.1 contract-first           | Уже заморожен frontend-контракт                                  |
| Database           | PostgreSQL 17                                        | Транзакции, constraints, JSONB snapshots и зрелая эксплуатация   |
| ORM/migrations     | Prisma ORM 7 + Prisma Migrate                        | Type-safe доступ, migrations и поддержка PostgreSQL/OCC          |
| Object storage     | S3-compatible adapter через AWS SDK                  | Signed uploads и возможность сменить provider                    |
| Local/test storage | MinIO только в закрытом local/test environment       | Воспроизводимый S3-compatible стенд                              |
| Jobs               | BullMQ + Redis, подключать с media/render milestone  | Retry/backoff и простые отдельные workers                        |
| Logs               | Pino JSON + requestId/correlationId                  | Структурированные логи без тяжёлой observability-платформы       |
| Tests              | Vitest, Testcontainers, OpenAPI/JSON Schema fixtures | Те же shared vectors и реальные PostgreSQL/storage checks        |

[Node.js 24 находится в LTS](https://nodejs.org/en/blog/release/v24.16.0),
NestJS 11 требует Node.js 20+ и официально поддерживает
[Fastify adapter](https://docs.nestjs.com/techniques/performance). Актуальный
[Prisma ORM](https://www.prisma.io/docs/orm) поддерживает Node.js 24 и
PostgreSQL 17/18; его transaction API описывает optimistic concurrency control.
MinIO предоставляет [S3-compatible API](https://min.io/docs/minio/linux/index.html)
для локального стенда. BullMQ требует проектировать
[idempotent jobs](https://docs.bullmq.io/patterns/idempotent-jobs) и поддерживает
retry с backoff.

## Структура отдельного backend-репозитория

```text
photobook-back/
  apps/
    api/             # HTTP, auth guards, DTO mapping
    worker/          # media/render jobs; появляется не раньше B3/B4
  packages/
    contracts/       # imported OpenAPI/JSON Schema artifacts, validators
    database/        # Prisma schema, migrations, repositories
    domain/          # project/revision/order state transitions
    infrastructure/  # storage, SMS, payment and queue adapters
    config/          # typed runtime configuration
    test-support/    # containers, factories, shared contract runner
  docs/
    adr/             # runtime-specific decisions and provider records
```

Frontend и backend остаются отдельными репозиториями. Wire artifacts
синхронизируются по зафиксированному commit/version; backend не импортирует
frontend runtime-код и не создаёт вторую несовместимую копию DTO.

## Deployment units

Для MVP достаточно модульного монолита:

```text
browser -> API -> PostgreSQL
              -> S3-compatible storage
              -> SMS/payment adapters
              -> Redis/BullMQ -> worker (только media/render)
```

Не вводятся microservices, GraphQL, Kafka/RabbitMQ, Kubernetes, event sourcing,
service mesh или AI infrastructure. API и worker могут собираться из одного
репозитория, но запускаются разными процессами после появления фоновых jobs.

## Environments

| Environment | Database              | Storage                  | OTP/payment                 | Назначение                          |
| ----------- | --------------------- | ------------------------ | --------------------------- | ----------------------------------- |
| local       | PostgreSQL container  | private MinIO container  | deterministic fake adapters | Разработка без внешних данных       |
| test/CI     | disposable PostgreSQL | disposable MinIO         | fake/allowlisted sandbox    | Contract и integration tests        |
| staging     | отдельная managed DB  | private test bucket      | provider sandbox/allowlist  | No-mock frontend flow               |
| production  | provider pending      | private provider pending | договорные adapters         | Только после security/privacy gates |

Каждый environment имеет отдельные credentials, buckets, database и cookie
domain. Production data не копируется в local/test. Signed URL, OTP, session,
CSRF secret и payment keys не попадают в Git, browser logs или CI artifacts.

## Обязательные B0 primitives

- config validation при старте без вывода secret value;
- `/health/live` без проверки зависимостей и `/health/ready` с bounded checks;
- request ID из доверенного proxy либо новый server-generated UUID;
- JSON logs с redaction телефона, cookie, OTP, signed URL и photo metadata;
- graceful shutdown API/worker и остановка при failed migration;
- отдельный direct DB connection для migrations и pooled runtime connection;
- database constraints для idempotency keys и revision uniqueness;
- object keys генерируются backend и не содержат исходное имя файла;
- jobs атомарны и идемпотентны; retry не создаёт второй asset/render/order;
- OpenAPI и shared invalid fixtures запускаются в CI backend.

## Не принятые решения

До backend scaffold не блокируют работу:

- конкретный production hosting и регион;
- managed PostgreSQL, Redis и S3 provider;
- production domain, cookie domain и trusted origins;
- SMSPro contract и fallback provider;
- банк, dynamic QR/webhook и fiscal integration;
- PDF renderer и ICC/color pipeline;
- сроки retention оригиналов, thumbnails, PDF и audit.

Они блокируют production deployment соответствующей возможности и фиксируются
отдельными ADR после коммерческого, privacy или print gate.

## Ratification checklist

- [ ] Backend owner подтверждает stack или записывает конкретное изменение.
- [x] Создан отдельный backend repository и pinned runtime/tool versions.
- [x] Local containers проходят health checks.
- [ ] Миграция создаёт чистую test database с нуля и откатывается по политике.
- [x] OpenAPI, structural JSON Schema fixtures и authoritative domain-invalid
      validation проходят backend validator.
- [x] Local test storage проходит signed PUT/complete/actual-expiry/renew proof;
      production storage и CORS остаются отдельным gate.
- [ ] Production provider decisions записаны до соответствующей интеграции.

Только ratification и evidence переводят B0 из provisional decision в
реализованную инфраструктуру.

Техническое evidence от 23 июля 2026 года: создан `photobook-back`, pinned
PostgreSQL/MinIO containers проходят health checks, initial Prisma migration
успешно применена к отдельной пустой disposable database, bucket bootstrap и
API `/health/live`/`/health/ready` проверены локально. Пункт migration остаётся
открытым до принятия rollback/roll-forward policy; весь B0 остаётся
`PROVISIONAL_ACCEPTED` до назначения и ratification Backend owner.
