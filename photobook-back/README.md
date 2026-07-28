# Photobook backend

Backend модульного монолита для сервиса фотокниг. Реальный вертикальный срез
заменяет frontend-моки для auth/session, catalog, project/revision,
upload/assets и preflight/approval. Payment, render worker, Redis/BullMQ и AI
пока не входят в scope.

## Стек

Node.js 24 LTS, strict TypeScript, NestJS 11 с Fastify, PostgreSQL 17,
Prisma ORM 7 и S3-compatible storage через AWS SDK.

## Быстрый старт

Требования: Node.js 24+, pnpm 11+ и Docker Compose.

```bash
pnpm install
pnpm contracts:sync
pnpm docker:up
pnpm prisma:generate
pnpm prisma:migrate --name init
pnpm seed:reference
pnpm storage:bootstrap
pnpm dev
```

API: `http://localhost:4000`.

- `GET /health/live` — процесс работает;
- `GET /health/ready` — PostgreSQL и object storage доступны.

Локальная авторизация использует код `246810`. Это значение разрешено только в
`local`/`test`; staging и production не запустятся без отдельного SMS provider.

Реализованный B2–B4 HTTP-срез:

- phone challenge, verify, resend, session и logout;
- immutable versioned catalog и provisional price quote;
- список, создание и загрузка пользовательских проектов;
- idempotent create и optimistic-concurrency autosave immutable revisions;
- owner-scoped asset list, signed upload batch, completion и renew;
- реальная прямая загрузка JPEG/PNG в MinIO, проверка storage metadata,
  trusted pixel dimensions и временные private preview URL;
- authoritative document preflight с точной привязкой issues к элементам;
- immutable revision-bound approval, идемпотентный повтор и обязательное
  повторное утверждение после изменения макета;
- DRAFT render HTTP gate: проверка владельца и актуальности approval с честным
  `RENDER_PROFILE_UNAVAILABLE` до M0, без создания job или очереди;
- immutable `PrintProfileV1`: единый валидируемый набор производственной
  геометрии и PDF-требований с content-derived версией и явным M0 approval gate.

Локальные значения имеют безопасные development defaults. `.env` нужен только
для переопределения; production и staging обязаны передавать конфигурацию
явными environment variables.

Локальный CORS object storage задаётся инфраструктурой через
`MINIO_API_CORS_ALLOW_ORIGIN` в `docker-compose.yml`. В staging/production CORS
для S3 bucket настраивается инфраструктурой отдельно от приложения.

## Команды

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm contracts:lint
pnpm test
pnpm test:database
pnpm build
pnpm check
```

## Источник API-контрактов

Wire source of truth находится в `../photobook-front/docs/api`. Команда
`pnpm contracts:sync` копирует нормативные OpenAPI, JSON Schema, fixtures и
examples в `packages/contracts/artifacts` и записывает SHA-256 digest исходных
контрактов в manifest. Backend не импортирует frontend runtime-код.

## Структура

```text
apps/api                  HTTP API и NestJS modules
packages/config           runtime configuration
packages/contracts        synchronized wire artifacts
packages/database         Prisma schema и client factory
packages/domain           canonical hashing и revision primitives
scripts                   local setup and contract synchronization
```

Архитектурное решение и границы этапа:
[`docs/adr/0001-backend-foundation.md`](docs/adr/0001-backend-foundation.md).
Правила shared validation и immutable revisions:
[`docs/adr/0002-contract-validation-and-revisions.md`](docs/adr/0002-contract-validation-and-revisions.md).
Безопасность и HTTP-границы B2:
[`docs/adr/0003-auth-catalog-and-project-api.md`](docs/adr/0003-auth-catalog-and-project-api.md).
Прямая загрузка и private asset read model:
[`docs/adr/0004-direct-asset-upload.md`](docs/adr/0004-direct-asset-upload.md).
Авторитетный preflight и immutable approval:
[`docs/adr/0005-authoritative-preflight-and-approval.md`](docs/adr/0005-authoritative-preflight-and-approval.md).
Render-profile gate без преждевременной очереди:
[`docs/adr/0006-render-profile-gate.md`](docs/adr/0006-render-profile-gate.md).
Immutable print-profile contract:
[`docs/adr/0007-immutable-print-profile.md`](docs/adr/0007-immutable-print-profile.md).
