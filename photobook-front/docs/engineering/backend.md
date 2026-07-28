# Backend ТЗ и API-контракт Photobook

> Версия документа: 0.1 draft.  
> Обновлён: 22 июля 2026 года.
> Статус: contract-first основа для параллельной разработки frontend и backend.  
> Первый рынок: Бишкек, Кыргызстан.  
> Первый продуктовый этап: ручной конструктор фотокниг без AI.

Порядок delivery и business/print gates задаёт
`../planning/roadmap.md`. Этот файл является подробным backend/API
backlog, а не требованием реализовать все endpoints до первой интеграции.

## 1. Назначение

Этот документ описывает обязанности backend, общие API-правила, основные
сущности, endpoint-реестр, асинхронные процессы, безопасность и порядок
синхронизации с frontend.

Цель параллельной разработки:

> Frontend работает через RTK Query и MSW по согласованному контракту, backend
> независимо реализует тот же контракт, после чего моки выключаются без
> переписывания страниц и пользовательских сценариев.

Документ фиксирует наблюдаемое поведение системы независимо от runtime. Для
scaffold принят provisional B0 stack в `backend-stack.md`: Node.js/TypeScript,
NestJS/Fastify, PostgreSQL/Prisma, S3-compatible storage и BullMQ/Redis.
Назначенный Backend owner должен подтвердить это решение до `BACKEND_READY`;
wire-контракт не зависит от выбранных библиотек.

## 2. Источники истины

По мере реализации источниками истины становятся:

1. `docs/api/openapi.yaml` — HTTP API.
2. Типы `core/book` — исходник доменной модели и команд.
3. `docs/api/schemas/book-document-v1.schema.json` — сгенерированный контракт
   документа книги для других платформ.
4. `docs/api/schemas/book-command-v1.schema.json` — сгенерированный контракт
   команд конструктора.
5. Примеры запросов и ответов в `docs/api/examples`.
6. Этот документ — поведение, нефункциональные требования и roadmap.

Эти файлы создаются не пустыми заготовками, а вместе с первой реальной схемой:

- Book Document JSON Schema — на этапе frontend P1;
- Book Command JSON Schema — на этапе frontend P2;
- OpenAPI и первые examples — до начала frontend P3 и backend B2.

TypeScript-типы frontend, MSW fixtures и backend DTO должны соответствовать
одной версии OpenAPI/JSON Schema. Нельзя поддерживать отдельный «frontend DTO» и
другой «backend DTO» для одного wire-контракта.

План автоматизации при появлении первых схем:

- JSON Schema документа/команд генерируется из ограниченных TypeScript-типов
  `core/book`, а CI проверяет отсутствие diff;
- HTTP DTO frontend генерируются из OpenAPI;
- JSON Schema и OpenAPI examples проверяются в тестах через JSON Schema
  validator без добавления Zod в приложение;
- конкретные dev-tools выбираются на P1/P3 и фиксируются в README, но
  сгенерированные файлы не редактируются вручную.

## 3. Статусы контракта

Каждая группа endpoints проходит состояния:

| Статус           | Значение                                                      |
| ---------------- | ------------------------------------------------------------- |
| `DRAFT`          | Обсуждается; несовместимые изменения допустимы                |
| `FROZEN`         | Request, response, ошибки и examples согласованы              |
| `BACKEND_READY`  | Backend реализовал контракт и прошёл contract tests           |
| `FRONTEND_READY` | RTK Query, MSW и frontend flow реализованы по контракту       |
| `INTEGRATED`     | Моки выключены, frontend и backend прошли интеграционный flow |

Правило: backend не начинает финальную реализацию endpoint до `FROZEN`, но
может параллельно готовить инфраструктуру, таблицы, repository и service layer.

Текущий статус групп:

| Группа                      | Статус                                  | Следующая точка    |
| --------------------------- | --------------------------------------- | ------------------ |
| Общие conventions и errors  | `FROZEN` для slice 1                    | Backend acceptance |
| Auth/session/CSRF           | `FROZEN` internally                     | Backend acceptance |
| Catalog version             | `FROZEN`                                | Backend acceptance |
| Price                       | `DRAFT`, frontend-ready                 | Backend review     |
| Project/revision/autosave   | `FROZEN`                                | Backend acceptance |
| Assets/upload lifecycle     | `FROZEN`, frontend-ready                | Backend acceptance |
| Asset list/thumbnail read   | `FROZEN`, frontend-ready                | Backend acceptance |
| Media processing/delete     | `DRAFT`                                 | M3 / backend B3    |
| Preflight/approval          | `FROZEN` internally                     | Backend acceptance |
| Print render                | `DRAFT`                                 | M4                 |
| Mock order/status           | `DRAFT`, frontend-ready                 | Backend review     |
| Account project/order lists | `DRAFT`, frontend-ready                 | Backend review     |
| Payment/production delivery | `DRAFT`                                 | M5                 |
| Analytics event dictionary  | `FROZEN` internally                     | Transport ADR      |
| Operator API                | `DRAFT`, read-only slice frontend-ready | M5 mutations       |

### 3.1. Draft `BookDocumentV1` после frontend P1.1

Frontend draft доступен в следующих общих артефактах:

- `src/core/book/model/bookDocumentV1.ts` — TypeScript-модель;
- `docs/api/schemas/book-document-v1.schema.json` — JSON Schema draft 2020-12;
- `docs/api/fixtures/book-document/v1/valid/` — valid test vector;
- `docs/api/fixtures/book-document/v1/invalid/` — invalid test vectors.

Текущий контракт фиксирует `schemaVersion: 1`, metadata, product selection,
asset references, отдельную cover и ordered spreads. Геометрия хранится в
миллиметрах, crop и focal point — в диапазоне `0..1`. `layoutSlotKey` связывает
конкретный элемент документа со slot из immutable `LayoutSpec`, а `id` остаётся
уникальной identity элемента. Неизвестные поля отклоняются через
`additionalProperties: false`.

Все текущие production-dependent ID и размеры явно помечены `mock`. Backend не
должен переносить их в production catalog. P1.2 добавил конфигурации и базовые
правила совместимости. P1.3 добавил frontend validator и persistence boundary.

Backend authoritative validation должна проверять те же правила:

- глобальную уникальность document entity/asset IDs;
- catalog version, product/spec, options, theme и template references;
- допустимый spread count;
- существование layout, правильный surface, size и slot geometry;
- отсутствие неизвестных/дублированных `layoutSlotKey` и наличие required slots;
- существование каждого назначенного asset;
- crop/focal point в `0..1`, включая `x + width <= 1` и `y + height <= 1`;
- разрешённые text role/style для layout, theme и product.

Frontend persistence boundary различает `invalid_json`,
`unsupported_schema_version`, `invalid_structure` и `invalid_document` с
типизированными domain issues. Backend может использовать собственные internal
types, но публичная validation error должна сохранять стабильные code/path и не
возвращать stack trace. Migration interface создан, registry пуст до появления
реальной версии 2.

Для backend acceptance `BookDocumentV1` и перехода к `BACKEND_READY` backend
должен:

1. провалидировать те же fixtures своей JSON Schema библиотекой;
2. прогнать domain-invalid fixture через authoritative validator;
3. подтвердить, что document хранится внутри immutable revision snapshot;
4. подтвердить отказ от неизвестных полей и неподдерживаемого `schemaVersion`;
5. вернуть замечания к wire shape до начала финальной persistence реализации.

### 3.2. Draft `BookCommandV1` после frontend P2

Общие артефакты:

- `src/core/book/commands/` — TypeScript union и чистое применение;
- `src/core/book/history/` — локальные history primitives;
- `docs/api/schemas/book-command-v1.schema.json` — JSON Schema draft 2020-12;
- `docs/api/fixtures/book-command/v1/` — valid, schema-invalid и domain-invalid
  test vectors.

Команда — это serializable discriminated union с полем `type`; текущий набор:

- `set_book_title`, `set_cover_option`, `set_theme_option`;
- `set_spread_layout`;
- `assign_photo`, `remove_photo`, `set_photo_crop`,
  `set_photo_focal_point`, `swap_photos`;
- `set_text`, `remove_text`;
- `add_spread`, `remove_spread`, `reorder_spread`.

`set_spread_layout` передаёт конкретные photo/text slots нового разворота, но
не может произвольно изменить производственную геометрию: весь полученный
документ проверяется против выбранного `LayoutSpec`. `set_cover_option` и
`set_theme_option` также принимаются только когда итоговая product/theme/template
комбинация разрешена immutable catalog version.

Чистая `applyBookCommand` возвращает новый документ либо одну из типизированных
ошибок:

- `target_not_found` — указанный spread, photo slot или text block отсутствует;
- `invalid_command` — payload логически невозможен, например index вне массива;
- `document_invalid` — результат нарушает `BookDocumentV1`/catalog invariants и
  содержит стабильный список domain issues.

Пустой required photo/text content не считается структурной поломкой команды:
успешный результат сохраняет редактируемый draft и возвращает
`required_photo_missing`/`required_text_missing` в `issues`. Эти проблемы должны
блокировать preflight/approval, но не ручное редактирование и autosave draft.
Отсутствие самого required slot, неверная geometry или неизвестная catalog
ссылка остаются `document_invalid`.

P2.2 реализован следующим образом:

- `applyBookCommandBatch` принимает непустой ordered array команд;
- ошибка `empty_batch` отклоняет отсутствие законченной операции;
- ошибка `command_failed` содержит индекс, тип и cause неуспешной команды;
- при любой ошибке наружу не возвращается частично изменённый документ;
- один принятый batch создаёт одну локальную запись history;
- undo/redo отменяет или повторяет batch целиком;
- новая операция после undo очищает redo branch;
- frontend хранит не более 100 последних операций.

Команды пока не являются отдельным MVP HTTP endpoint. В будущем AI может
возвращать тот же batch, после чего frontend применяет его и показывает
результат в обычном конструкторе.

JSON Schema описывает одну команду и переиспользует definitions photo/text/crop/
spread из `BookDocumentV1`. Backend должен зарегистрировать обе схемы и
валидировать каждый элемент batch. Batch и локальная history не являются
autosave DTO: MVP по-прежнему сохраняет полный snapshot документа. Контракт
остаётся `DRAFT`, пока backend не прогонит те же fixtures и не подтвердит wire
shape.

### 3.3. Draft первой HTTP contract-группы после frontend P3

Frontend подготовил:

- `docs/api/openapi.yaml` — OpenAPI 3.1 entry point;
- `docs/api/schemas/http-contract-v1.schema.json` — общие HTTP DTO;
- `docs/api/examples/` — success, auth, not found, validation, idempotency и
  revision conflict payloads;
- Redocly recommended-lint и Ajv contract tests для всех примеров.

В первый slice намеренно входят только:

- `GET /api/v1/catalog/versions/{catalogVersion}`;
- `POST /api/v1/projects`;
- `GET /api/v1/projects/{projectId}`;
- `PUT /api/v1/projects/{projectId}/document`.

Draft фиксирует opaque IDs, UTC, единый `ErrorEnvelope`, cookie session,
`X-CSRF-Token` для mutations, обязательный `Idempotency-Key` создания проекта и
optimistic concurrency autosave через `baseRevisionId`/`clientMutationId`.
Autosave возвращает новую immutable revision, а stale base — безопасный
`PROJECT_REVISION_CONFLICT` с `latestRevisionId`. Frontend readiness review также
добавил отсутствовавшие `CSRF_INVALID`, validation создания, безопасный `404`
для autosave и `CLIENT_MUTATION_ID_REUSED` для повторного mutation ID с другим
payload.

Точная матрица ответов, retry semantics и лист backend-приёмки вынесены в
`../api/backend-handoff.md`. Внутренний `FROZEN` разрешает frontend
mock development, но не равен backend acceptance, `BACKEND_READY` или
`INTEGRATED`.

Группа получила внутренний `FROZEN` по решению Product Owner, чтобы frontend мог
продолжить MSW-разработку без назначенного backend owner. До `BACKEND_READY`
backend всё равно должен:

1. прогнать `pnpm openapi:lint` или эквивалентный OpenAPI 3.1 validator;
2. провалидировать все examples своей JSON Schema библиотекой;
3. подтвердить `ProjectDetail` shape и создание первой revision;
4. подтвердить хранение/уникальность `clientMutationId` и idempotency key;
5. подтвердить, что object-level authorization скрывает чужой project как 404;
6. вернуть замечания по cookie/CSRF только после решения production origins.

Для project creation одинаковые key/body должны вернуть исходный `201` без
нового проекта, а другой body — `IDEMPOTENCY_KEY_REUSED`. Для autosave одинаковые
`clientMutationId`/base/document должны вернуть исходный `200` без новой
revision, а другой payload — `CLIENT_MUTATION_ID_REUSED`.

### 3.4. Вторая HTTP contract-группа: auth/session

Frontend P6.1 добавил в OpenAPI и shared HTTP Schema:

- `POST /api/v1/auth/challenges`;
- `POST /api/v1/auth/challenges/{challengeId}/verify`;
- `POST /api/v1/auth/challenges/{challengeId}/resend`;
- `GET /api/v1/auth/session`;
- `POST /api/v1/auth/logout`.

Wire shape внутренне заморожен для параллельной mock-разработки. Challenge
принимает E.164 phone и locale, но не раскрывает существование аккаунта.
Verification возвращает user и CSRF token, а opaque session остаётся в
`HttpOnly` cookie. Session bootstrap возвращает `200` и явный discriminated
union как для authenticated, так и для anonymous состояния. Logout требует
session cookie и `X-CSRF-Token`, инвалидирует сессию и возвращает `204`.
Защищённый endpoint различает отсутствие cookie (`AUTH_REQUIRED`) и
неактивную cookie-сессию (`SESSION_EXPIRED`). Редактор сохраняет локальный
draft, отправляет пользователя на повторный вход с безопасным `returnTo` и
возобновляет autosave после новой authenticated session.

Examples покрывают success, validation, invalid/expired OTP, rate limit и
недоступность внешнего провайдера. Внутренний `FROZEN` не выбирает SMS provider,
production origins, cookie domain или окончательный rate-limit policy. Эти
решения обязательны до `BACKEND_READY` и интеграции без MSW.

## 4. Процесс для каждой новой функции

1. Frontend и backend описывают пользовательский сценарий и владельца данных.
2. В этом документе обновляются endpoint, DTO, ошибки и состояния.
3. Добавляются или изменяются OpenAPI, JSON Schema и examples.
4. Контракт получает статус `FROZEN`.
5. Frontend создаёт RTK Query endpoint и MSW handler из того же контракта.
6. Backend реализует endpoint и проверяет те же examples/test vectors.
7. Обе стороны отдельно проходят contract tests.
8. Frontend запускается с `VITE_ENABLE_MOCKS=false` против test backend.
9. Проверяются success, validation, auth, conflict и retry сценарии.
10. Группа получает статус `INTEGRATED`.

Интеграция выполняется сразу для готовой группы. Нельзя ждать реализации всего
backend или всего mock-frontend. MSW после интеграции остаётся test adapter.

Любое breaking change после `FROZEN` требует:

- объяснения причины;
- обновления OpenAPI и examples;
- обновления MSW и frontend mapping;
- новой версии схемы, если меняется сохранённый документ;
- записи в changelog контракта.

## 5. Границы ответственности

### Frontend

- визуальный редактор и локальный screen renderer;
- локальная история undo/redo;
- применение типизированных `BookCommand`;
- transient drag/crop state;
- оптимистическая проверка документа;
- безопасное локальное хранение несинхронизированных изменений;
- получение signed upload URL и прямая отправка файла;
- отображение публичных кодов ошибок понятным русским текстом.

### Backend

- идентификация пользователя и сессии;
- проверка доступа к каждому проекту, asset, revision и заказу;
- хранение проектов и версий документа;
- optimistic concurrency и idempotency;
- каталог, immutable catalog versions и серверная цена;
- signed upload URL, метаданные asset и фоновые задачи;
- authoritative preflight перед утверждением;
- immutable approved revision;
- очередь render jobs и печатный PDF;
- заказы, платежи, статусы и административные операции;
- аудит, хранение и удаление данных.

### Общая ответственность

- одна схема `BookDocumentV1`;
- одинаковые fixture/test vectors для допустимых и недопустимых документов;
- одинаковые enum и правила переходов статусов;
- одинаковое понимание physical geometry, crop и текста;
- отсутствие silently accepted неизвестных полей в критических схемах.

## 6. Общие API-правила

### 6.1. Транспорт и версия

- HTTPS обязателен вне локальной разработки.
- Base path: `/api/v1`.
- Формат: JSON UTF-8, кроме прямой загрузки файлов в object storage.
- Wire JSON использует `camelCase`.
- `Content-Type: application/json` для JSON body.
- Frontend отправляет `Accept: application/json`.
- API version меняется только при несовместимом HTTP-контракте.
- Версия `BookDocument` меняется независимо через `schemaVersion`.

### 6.2. Идентификаторы и время

- Все ID — opaque string; frontend не анализирует их формат.
- Backend может использовать UUID или ULID.
- Время передаётся в ISO 8601 UTC, например `2026-07-21T08:30:00Z`.
- Дата без времени — `YYYY-MM-DD`.
- Backend хранит время в UTC; локализацию выполняет frontend.

### 6.3. Деньги

Деньги не передаются float-значением.

```json
{
  "amountMinor": 325000,
  "currency": "KGS"
}
```

- `amountMinor` — целое число в тыйынах.
- `currency` первого релиза — `KGS`.
- Frontend никогда не считается источником финальной цены.
- Quote имеет ID и срок действия.

### 6.4. Pagination

Для списков используется cursor pagination:

```json
{
  "items": [],
  "pageInfo": {
    "nextCursor": null,
    "hasNextPage": false
  }
}
```

Query parameters:

- `cursor` — opaque string;
- `limit` — по умолчанию 20, максимум 100.

### 6.5. Idempotency

`Idempotency-Key` обязателен для:

- создания проекта после upload flow;
- создания order;
- создания payment attempt;
- запуска render job;
- повторяемых завершений upload.

Повтор с тем же ключом и тем же body возвращает прежний результат. Тот же ключ
с другим body возвращает `409 IDEMPOTENCY_KEY_REUSED`.

### 6.6. Optimistic concurrency

Сохранение документа использует:

- `baseRevisionId` — версия, от которой редактировал клиент;
- `clientMutationId` — уникальный ID попытки autosave.

Backend не перезаписывает более новую версию молча. При конфликте возвращается
`409 PROJECT_REVISION_CONFLICT` и ID последней серверной версии.

### 6.7. Политика неизвестных полей

- Критические команды, `BookDocument`, checkout, payment и admin mutations
  отклоняют неизвестные поля.
- Публичные read models могут расширяться только backward-compatible полями.
- Frontend не должен падать из-за нового необязательного поля.

## 7. Ошибки

Единый envelope:

```json
{
  "error": {
    "code": "PROJECT_REVISION_CONFLICT",
    "message": "Проект был изменён в другом окне.",
    "requestId": "req_01J...",
    "retryable": false,
    "fieldErrors": [],
    "details": {
      "latestRevisionId": "rev_01J..."
    }
  }
}
```

Правила:

- `code` — стабильная машинная часть контракта.
- `message` — безопасный fallback, без stack trace, SQL, provider response и PII.
- Frontend в первую очередь отображает локальный текст по `code`.
- `requestId` можно сообщить поддержке.
- `retryable` означает, что повтор той же операции безопасен.
- `fieldErrors` содержит `{ field, code, message }`.
- `details` разрешён только для документированных безопасных значений.

Базовые HTTP-коды:

| HTTP | Когда                                            |
| ---- | ------------------------------------------------ |
| 400  | Невалидный JSON или неподдерживаемая структура   |
| 401  | Нет или истекла сессия                           |
| 403  | Сессия есть, но нет права                        |
| 404  | Ресурс не существует или скрыт политикой доступа |
| 409  | Revision, status или idempotency conflict        |
| 413  | Превышен размер/лимит                            |
| 422  | Бизнес-валидация и field errors                  |
| 429  | Rate limit                                       |
| 500  | Неожиданная внутренняя ошибка                    |
| 502  | Ошибка внешнего провайдера                       |
| 503  | Временная недоступность                          |

Обязательные error codes первого релиза:

- `VALIDATION_FAILED`;
- `INTERNAL_ERROR`;
- `AUTH_REQUIRED`;
- `AUTH_CODE_INVALID`;
- `AUTH_CODE_EXPIRED`;
- `SESSION_EXPIRED`;
- `CSRF_INVALID`;
- `RATE_LIMITED`;
- `RESOURCE_NOT_FOUND`;
- `ACCESS_DENIED`;
- `PROJECT_REVISION_CONFLICT`;
- `PROJECT_STATUS_CONFLICT`;
- `IDEMPOTENCY_KEY_REUSED`;
- `CLIENT_MUTATION_ID_REUSED`;
- `UPLOAD_EXPIRED`;
- `UPLOAD_INVALID_FILE`;
- `UPLOAD_INCOMPLETE`;
- `CATALOG_VERSION_UNAVAILABLE`;
- `PRICE_QUOTE_EXPIRED`;
- `PREFLIGHT_BLOCKED`;
- `APPROVAL_OUTDATED`;
- `RENDER_FAILED`;
- `ORDER_ALREADY_EXISTS`;
- `PAYMENT_FAILED`;
- `PAYMENT_EXPIRED`;
- `EXTERNAL_PROVIDER_UNAVAILABLE`.

## 8. Авторизация и безопасность сессии

### 8.1. Внутренне замороженное wire-решение первого этапа

- Основной вход: телефон в формате E.164 и OTP.
- Резервный email-вход откладывается до подтверждённой необходимости.
- Backend устанавливает opaque session cookie.
- Cookie: `HttpOnly`, `Secure` в production, `SameSite=Lax`, ограниченный Path.
- Production frontend и API должны быть same-site, если инфраструктура позволяет.
- CORS разрешает только явные origins; wildcard с credentials запрещён.
- Мутации авторизованной сессии требуют `X-CSRF-Token`.
- CSRF token возвращается через session response и хранится frontend в памяти.
- Публичные auth challenge endpoints защищаются Origin check и rate limiting.

### 8.2. Auth endpoints

#### `POST /api/v1/auth/challenges`

Request:

```json
{
  "channel": "phone",
  "contact": "+996555123456",
  "locale": "ru"
}
```

Response `201`:

```json
{
  "challengeId": "challenge_01J...",
  "maskedContact": "+996 *** ** 56",
  "expiresAt": "2026-07-21T08:35:00Z",
  "resendAvailableAt": "2026-07-21T08:31:00Z"
}
```

Ошибки: `VALIDATION_FAILED`, `RATE_LIMITED`,
`EXTERNAL_PROVIDER_UNAVAILABLE`.

#### `POST /api/v1/auth/challenges/{challengeId}/verify`

```json
{
  "code": "123456"
}
```

Response `200`:

```json
{
  "user": {
    "id": "user_01J...",
    "name": null,
    "phone": "+996555123456",
    "email": null,
    "locale": "ru",
    "profileCompleted": false
  },
  "csrfToken": "csrf_..."
}
```

Ошибки: `AUTH_CODE_INVALID`, `AUTH_CODE_EXPIRED`, `RATE_LIMITED`.

#### `POST /api/v1/auth/challenges/{challengeId}/resend`

Возвращает обновлённые `expiresAt` и `resendAvailableAt`. Повтор до разрешённого
времени возвращает `429 RATE_LIMITED` с `Retry-After`.

#### `GET /api/v1/auth/session`

Неавторизованный ответ также `200`:

```json
{
  "authenticated": false,
  "user": null,
  "csrfToken": null
}
```

Авторизованный ответ содержит `authenticated: true`, `user`, `csrfToken`.

#### `PATCH /api/v1/account/profile`

Изменяет имя, необязательный email, locale и notification preferences.

#### `POST /api/v1/auth/logout`

Инвалидирует текущую сессию и очищает cookie. Response `204`.

### 8.3. Auth ограничения

- Не сообщать, зарегистрирован ли контакт.
- OTP хранить только в защищённом/хешированном виде и с коротким TTL.
- Ограничить число запросов на контакт, IP и device fingerprint при наличии.
- Инвалидировать challenge после успешного использования.
- Аудировать подозрительные попытки без записи OTP в лог.

## 9. Catalog и цена

### 9.1. Версионирование каталога

Проект привязывается к immutable `catalogVersion`. Обновление каталога не должно
ломать старый проект или менять его геометрию.

Catalog version содержит:

- products и physical specs;
- product options;
- themes;
- layouts;
- templates/story structures;
- typography roles;
- compatibility rules;
- production constraints.

Frontend P1.2 draft теперь фиксирует минимальные структуры:

- `ProductSpec`: physical spec ID, product ID/type, `productionStatus`, размеры
  cover/spread, диапазон разворотов, options и allowlists конфигураций;
- `LayoutSpec`: surface `cover|spread`, размер, photo/text slots, required flags,
  default crop/focal point, default text style и `maxCharacters` для каждого
  текстового слота;
- `ThemeSpec`: palette и ограниченный список text styles с разрешёнными
  `textAlign` и `colorToken`;
- `TemplateSpec`: recommendation category tags, theme, cover layout и ordered
  initial spread layouts;
- `BookConfigurationBundle`: immutable `catalogVersion` и массивы specs.

Общий test vector находится в
`docs/api/fixtures/catalog/v1/valid/mock-book-config-bundle.json` и должен
использоваться backend-командой при проектировании catalog DTO. Категории не
участвуют в compatibility decision. Compatibility требует двусторонний allowlist
product/spec, совпадающую physical geometry, допустимый theme/text style и
корректный surface layout.

До заморозки Catalog API backend должен вернуть замечания к названиям полей,
разделению product/product spec и immutable catalog version. Текущие значения
`1..3` spreads, `200 × 200` mm и все `mock-*` IDs не являются production
ограничениями.

Walking skeleton и первая alpha используют один референсный продукт, одну тему,
один шаблон и три layouts. Каталог расширяется до 6 layouts перед print-ready
alpha. Второй продукт и 10–15 layouts не являются входным условием backend API.

### 9.2. Endpoints

| Method | Path                                        | Назначение                     |
| ------ | ------------------------------------------- | ------------------------------ |
| GET    | `/api/v1/catalog/products`                  | Доступные продукты             |
| GET    | `/api/v1/catalog/templates`                 | Шаблоны с фильтрами            |
| GET    | `/api/v1/catalog/versions/{catalogVersion}` | Полный immutable config bundle |
| POST   | `/api/v1/price-quotes`                      | Серверный расчёт цены          |

Фильтры templates:

- `productId`;
- повторяемый `category`;
- `cursor`, `limit`.

Price quote request:

```json
{
  "productId": "standard-hardcover",
  "productSpecId": "standard-hardcover-200x200-v1",
  "catalogVersion": "catalog-2026-07-draft",
  "spreadCount": 15,
  "options": [
    {
      "optionId": "cover-color",
      "valueId": "sand"
    }
  ],
  "quantity": 1,
  "delivery": {
    "method": "pickup",
    "city": "Bishkek"
  }
}
```

Response:

```json
{
  "quoteId": "quote_01J...",
  "expiresAt": "2026-07-21T09:00:00Z",
  "items": [
    {
      "code": "BOOK_BASE",
      "label": "Фотокнига",
      "quantity": 1,
      "unitPrice": {
        "amountMinor": 300000,
        "currency": "KGS"
      },
      "total": {
        "amountMinor": 300000,
        "currency": "KGS"
      }
    }
  ],
  "total": {
    "amountMinor": 300000,
    "currency": "KGS"
  },
  "estimatedReadyDate": null,
  "priceStatus": "provisional"
}
```

`priceStatus` имеет значения `provisional` и `confirmed`. UI обязан явно
показывать provisional цену. Production launch запрещён с provisional quote,
но MSW и backend используют одну и ту же схему.

Frontend M2 реализует эту DRAFT-группу через RTK Query и MSW. Configurator и
checkout больше не вычисляют сумму локально: они отправляют точную версию
каталога, product spec, options, число разворотов и способ получения. Quote
имеет `quoteId`, срок действия и статус `provisional`; mock order обязан
ссылаться на показанный quote и отклоняет отсутствующий, истёкший или
несовпадающий расчёт кодом `PRICE_QUOTE_INVALID`. Это frontend readiness, а не
заморозка production-правил, оферта или `BACKEND_READY`.

## 10. Проекты и документы

### 10.1. Project read model

Минимальные поля:

- `id`;
- `ownerId`;
- `title`;
- `status`;
- `productId`;
- `templateId`;
- `categoryTags`;
- `catalogVersion`;
- `latestRevisionId`;
- `approvedRevisionId`;
- `coverPreviewUrl`;
- `createdAt`, `updatedAt`, `deletedAt`.

### 10.2. Project statuses первого этапа

- `draft`;
- `awaiting_upload`;
- `uploading`;
- `editing`;
- `ready_for_review`;
- `approved`;
- `archived`;
- `deleted`.

`analyzing` и `generating` резервируются до AI-этапа и не используются в
ручном MVP.

### 10.3. Endpoints

| Method | Path                                     | Назначение                    |
| ------ | ---------------------------------------- | ----------------------------- |
| POST   | `/api/v1/projects`                       | Создать проект                |
| GET    | `/api/v1/projects`                       | Проекты текущего пользователя |
| GET    | `/api/v1/projects/{projectId}`           | Проект и последняя revision   |
| PATCH  | `/api/v1/projects/{projectId}`           | Название/категории/архив      |
| DELETE | `/api/v1/projects/{projectId}`           | Soft delete                   |
| POST   | `/api/v1/projects/{projectId}/copies`    | Создать копию                 |
| GET    | `/api/v1/projects/{projectId}/revisions` | История сохранённых версий    |
| PUT    | `/api/v1/projects/{projectId}/document`  | Autosave полного документа    |

### 10.4. Создание проекта

```json
{
  "productId": "standard-hardcover",
  "templateId": "warm-family-story",
  "catalogVersion": "catalog-2026-07-draft",
  "categoryTags": ["family"],
  "spreadCount": 15,
  "optionSelections": [
    {
      "optionId": "cover-color",
      "valueId": "sand"
    }
  ]
}
```

Backend создаёт начальный `BookDocumentV1` из immutable template config и
возвращает `ProjectDetail` с первой revision.

### 10.5. Autosave

MVP сохраняет полный snapshot, а не отправляет каждое pointer-событие или всю
локальную undo-history.

```json
{
  "baseRevisionId": "rev_01J_old",
  "clientMutationId": "mutation_01J...",
  "document": {
    "schemaVersion": 1
  }
}
```

Полная структура `document` определяется отдельной JSON Schema.

Response:

```json
{
  "revisionId": "rev_01J_new",
  "revisionNumber": 14,
  "savedAt": "2026-07-21T08:40:00Z",
  "documentHash": "sha256:..."
}
```

Правила:

- backend валидирует schema, catalog compatibility и критические инварианты;
- `clientMutationId` предотвращает дублирование после retry;
- новый `revisionId` выдаётся на каждое принятое логическое сохранение;
- backend может compact внутреннее хранение, не меняя внешний контракт;
- approved revision остаётся immutable;
- последующее редактирование не меняет уже утверждённую версию;
- при 409 frontend сохраняет локальную копию и отдельно получает server revision;
- backend никогда не выбирает победителя конфликта молча.

Локальные команды нужны для undo/redo и будущего AI, но в первом MVP не являются
основным persistence endpoint. После AI-gate может появиться отдельный endpoint
для server-generated command batch.

## 11. Assets и прямая загрузка

### 11.1. Принцип

Оригинал идёт напрямую из браузера в закрытое object storage. API выдаёт
временную инструкцию, хранит asset metadata и подтверждает завершение.

### 11.2. Asset status

- `pending_upload`;
- `uploading`;
- `uploaded`;
- `processing`;
- `ready`;
- `failed`;
- `deleted`.

### 11.3. Endpoints

| Method | Path                                                         | Назначение                 |
| ------ | ------------------------------------------------------------ | -------------------------- |
| POST   | `/api/v1/projects/{projectId}/upload-batches`                | Выдать upload instructions |
| POST   | `/api/v1/projects/{projectId}/assets/{assetId}/complete`     | Подтвердить upload         |
| POST   | `/api/v1/projects/{projectId}/assets/{assetId}/renew-upload` | Обновить истёкшую подпись  |
| GET    | `/api/v1/projects/{projectId}/assets`                        | Список assets              |
| DELETE | `/api/v1/projects/{projectId}/assets/{assetId}`              | Удалить asset              |

Первые три mutation endpoint и `GET` списка внутренне `FROZEN` и реализованы
frontend/MSW. Thumbnail generation jobs, media processing и `DELETE` остаются
`DRAFT`. Полная матрица ответов и normative examples находятся в
`docs/api/openapi.yaml` и `docs/api/examples/uploads/`; backend acceptance
checklist — в `docs/api/backend-handoff.md`.

Upload batch request:

```json
{
  "files": [
    {
      "clientFileId": "local-1",
      "fileName": "IMG_1024.JPG",
      "mediaType": "image/jpeg",
      "sizeBytes": 4821341,
      "sha256": null,
      "capturedAt": "2026-06-10T14:20:00Z"
    }
  ]
}
```

Response:

```json
{
  "batchId": "upload_batch_01J...",
  "uploads": [
    {
      "clientFileId": "local-1",
      "assetId": "asset_01J...",
      "method": "PUT",
      "uploadUrl": "https://storage.example/signed...",
      "headers": {
        "Content-Type": "image/jpeg"
      },
      "expiresAt": "2026-07-21T08:50:00Z"
    }
  ]
}
```

Complete request:

```json
{
  "etag": "storage-etag",
  "sizeBytes": 4821341,
  "sha256": "optional-client-or-storage-checksum"
}
```

Asset list response:

```json
{
  "items": [
    {
      "assetId": "asset_01J...",
      "status": "ready",
      "fileName": "IMG_1024.JPG",
      "mediaType": "image/jpeg",
      "sizeBytes": 4821341,
      "pixelWidth": 4032,
      "pixelHeight": 3024,
      "capturedAt": "2026-06-10T14:20:00Z",
      "thumbnailUrl": "https://media.example/signed-preview...",
      "thumbnailExpiresAt": "2026-07-21T09:20:00Z",
      "createdAt": "2026-07-21T08:40:00Z"
    }
  ]
}
```

Правила:

- upload URL действует короткое время и только для одного object key;
- backend повторно проверяет ожидаемый размер и media type;
- complete является идемпотентным;
- при истёкшей подписи локальный файл не удаляется, frontend вызывает renew;
- asset нельзя использовать в чужом проекте;
- preview/thumbnail URL подписываются или проходят через авторизованный endpoint;
- `File` и `Blob` не входят в RTK Query cache или Redux;
- удаление asset, используемого в approved revision/order, не удаляет физический
  объект до завершения retention policy;
- thumbnail generation является background job;
- HEIC conversion добавляется только после отдельного device/media spike.
- `pixelWidth` и `pixelHeight` появляются после чтения сервером доверенных
  метаданных оригинала; клиентские значения не являются авторитетными;
- frontend использует размеры для раннего предупреждения качества конкретного
  слота, но окончательный DPI рассчитывает backend preflight по immutable
  revision, crop и физическому размеру layout slot;
- размеры, status и временные preview URL принадлежат Asset DTO и не
  дублируются в `BookDocumentV1`, где остаётся только стабильный `assetId`.
- новый `GET` списка может выдать другой временный preview URL для прежнего
  `assetId`; frontend обновляет read model при focus/reconnect и не меняет
  документ из-за ротации URL.

## 12. Preflight, утверждение и render

### 12.1. Endpoints

| Method | Path                                                     | Назначение                |
| ------ | -------------------------------------------------------- | ------------------------- |
| POST   | `/api/v1/projects/{projectId}/preflight-runs`            | Проверить revision        |
| GET    | `/api/v1/projects/{projectId}/preflight-runs/{id}`       | Статус/результат проверки |
| POST   | `/api/v1/projects/{projectId}/approvals`                 | Утвердить revision        |
| POST   | `/api/v1/projects/{projectId}/render-jobs`               | Запустить печатный render |
| GET    | `/api/v1/projects/{projectId}/render-jobs/{renderJobId}` | Статус render             |

Preflight request:

```json
{
  "revisionId": "rev_01J..."
}
```

Validation issue:

```json
{
  "id": "issue_01J...",
  "code": "PHOTO_RESOLUTION_LOW",
  "severity": "warning",
  "surfaceId": "spread-4",
  "elementId": "photo-slot-2",
  "messageKey": "preflight.photoResolutionLow",
  "details": {
    "actualDpi": 170,
    "requiredDpi": 240
  }
}
```

Severity:

- `info`;
- `warning` — можно утвердить после осознанного подтверждения, если разрешено;
- `blocking` — approval запрещён.

Approval request:

```json
{
  "revisionId": "rev_01J...",
  "preflightRunId": "preflight_01J...",
  "checklist": {
    "namesChecked": true,
    "datesChecked": true,
    "captionsChecked": true,
    "pageOrderChecked": true,
    "cropUnderstood": true,
    "readyForPrint": true
  },
  "acknowledgedWarningIds": []
}
```

Backend создаёт immutable `approvalId` и `approvedRevisionId`. Если latest
revision изменилась, старое approval не переносится на неё автоматически.

Текущий backend завершает preflight синхронно и возвращает `201` со статусом
`succeeded`. Первое approval возвращает `201`; повтор того же неизменённого
approval возвращает существующий объект с `200`.

Render job:

```json
{
  "approvalId": "approval_01J...",
  "type": "print_pdf",
  "retryOfRenderJobId": null
}
```

Status: `queued`, `running`, `succeeded`, `failed`, `cancelled`.

Operation-level DRAFT в OpenAPI фиксирует create/poll lifecycle, обязательный
`Idempotency-Key`, server-derived `renderProfileVersion` и безопасные output
metadata без object key/download URL. До принятия M0 print profile создание
job возвращает `RENDER_PROFILE_UNAVAILABLE` и ничего не ставит в очередь.
Backend уже исполняет эту границу: проверяет session/CSRF, shared request
schema, idempotency header, владельца и актуальность approval. Устаревшее
approval получает `APPROVAL_OUTDATED`; актуальное — ожидаемый
`RENDER_PROFILE_UNAVAILABLE`. Ни render job, ни idempotency record при этом не
создаются.

Внутренний `PrintProfileV1` уже собирает page/cover geometry, bleed, safe zone,
gutter, spread limits, DPI, PDF/color/ICC/font требования и manufacturing
evidence в одну immutable структуру. `renderProfileVersion` детерминированно
выводится из canonical SHA-256 полного профиля. Это не production instance:
mock-профиль не проходит activation guard, а approved-профиль невозможен без
M0 evidence, партнёра и Production owner.

При retry `retryOfRenderJobId` ссылается только на `failed`/`cancelled` job той
же approval. Approved revision не меняется, и frontend не должен повторно
заставлять пользователя утверждать тот же неизменённый документ.

## 13. Orders, delivery и payment

### 13.1. Order statuses

- `created`;
- `awaiting_payment`;
- `paid`;
- `preflight_check`;
- `in_production`;
- `binding`;
- `packaging`;
- `ready_for_pickup`;
- `out_for_delivery`;
- `completed`;
- `cancelled`;
- `reprint_required`.

Payment status хранится отдельно:

- `created`;
- `pending`;
- `paid`;
- `failed`;
- `expired`;
- `cancelled`;
- `refunded`.

### 13.2. Endpoints клиента

| Method | Path                                        | Назначение                  |
| ------ | ------------------------------------------- | --------------------------- |
| POST   | `/api/v1/orders`                            | Создать order               |
| GET    | `/api/v1/orders`                            | Заказы пользователя         |
| GET    | `/api/v1/orders/{orderId}`                  | Статус и детали             |
| POST   | `/api/v1/orders/{orderId}/payment-attempts` | Создать QR/платёжную ссылку |
| GET    | `/api/v1/orders/{orderId}/payments`         | Публичные статусы попыток   |

Order request:

```json
{
  "projectId": "project_01J...",
  "approvalId": "approval_01J...",
  "priceQuoteId": "quote_01J...",
  "quantity": 1,
  "contact": {
    "name": "Айжан",
    "phone": "+996555123456",
    "whatsAppPhone": "+996555123456",
    "email": null
  },
  "delivery": {
    "method": "pickup",
    "city": "Bishkek",
    "address": null,
    "comment": null
  },
  "partnerCode": null,
  "customerComment": null,
  "acceptedOfferVersion": "offer-2026-07",
  "approvedLayoutConfirmed": true
}
```

Текущий OpenAPI M2 намеренно описывает более узкую mock-форму без настоящего
`priceQuoteId`, `acceptedOfferVersion` и payment attempt. Она передаёт
`approvedRevisionId`, тестовое подтверждение условий и создаёт только заявку.
Операции помечены `DRAFT`: backend использует их для параллельного review, но не
считает production-контрактом до Price и Legal gates. Производственный request
выше остаётся целевой формой M5.

Backend проверяет:

- approval принадлежит пользователю и проекту;
- approved revision не изменена;
- quote не истёк и соответствует конфигурации;
- нельзя создать два заказа по одному idempotency key;
- partner code не влияет на клиентскую цену без явного правила quote;
- order хранит snapshot контактов, цены, комплектации и версии оферты.

Payment attempt response:

```json
{
  "paymentId": "payment_01J...",
  "status": "pending",
  "method": "manual_qr",
  "amount": {
    "amountMinor": 300000,
    "currency": "KGS"
  },
  "qrPayload": "provider-safe-qr-payload",
  "paymentUrl": "https://payment.example/...",
  "expiresAt": "2026-07-21T09:05:00Z"
}
```

Когда выбранный provider webhook входит в scope, он является backend-only
endpoint, проверяет подпись и не доверяет status от браузера. Повторный webhook
обрабатывается идемпотентно.

В закрытой beta обязательный первый вариант — `manual_qr` или простая платёжная
ссылка с ручным подтверждением оператором. Provider webhook и автоматический
status добавляются после измерения ручной нагрузки или если их требует выбранный
провайдер. Frontend получает status polling; WebSocket/SSE не требуются.

## 14. Analytics contract

Минимальная аналитика нужна до внешней alpha. Она не должна содержать фотографии,
текст книги, OTP, signed URL или произвольный PII payload.

Первый набор событий:

- `landingViewed`;
- `createStarted`;
- `productSelected`;
- `templateSelected`;
- `authCompleted`;
- `uploadStarted`;
- `uploadCompleted`;
- `editorOpened`;
- `firstEditCompleted`;
- `previewOpened`;
- `projectApproved`;
- `checkoutStarted`;
- `orderCreated`;
- `paymentConfirmed`;
- `orderCompleted`.

Event contract содержит:

- `eventId` для дедупликации;
- `eventName` из whitelist;
- `occurredAt`;
- `anonymousSessionId` до входа;
- разрешённые `projectId`/`orderId` после проверки доступа;
- версию event schema;
- небольшой whitelist properties для конкретного event.

Конкретный transport — first-party endpoint или согласованный analytics vendor —
фиксируется ADR до M2. Frontend event names и backend/business отчёты используют
один словарь.

## 15. Account и индивидуальные заявки

| Method | Path                            | Назначение               |
| ------ | ------------------------------- | ------------------------ |
| GET    | `/api/v1/account`               | Профиль, краткие counts  |
| PATCH  | `/api/v1/account/profile`       | Имя, email, locale       |
| POST   | `/api/v1/account/deletion`      | Запрос удаления аккаунта |
| POST   | `/api/v1/custom-order-requests` | Индивидуальная заявка    |

Custom request fields:

- `productType`: `calendar`, `card`, `school_book`, `school_preorder`,
  `corporate_book`, `bulk_print`, `custom_format`, `other`;
- `quantity` optional;
- `desiredDate` optional;
- `description`;
- `contactName`;
- `phone`;
- `materialUrl` optional;
- `comment` optional;
- `sourcePage`.

Endpoint должен принимать заявку без создания отдельного конструктора.

## 16. Admin API первого этапа

Admin API защищён ролью `operator`/`admin`, отдельным audit trail и более строгой
политикой сессии.

M2 frontend использует только `GET /api/v1/admin/orders/{orderId}`. Этот
read-only DRAFT возвращает order, project metadata, immutable revision summary,
approval и preflight run. Backend извлекает роль из сессии; клиент не передаёт
role header или доверенный claim. Очередь и все mutations остаются M5/B6.

| Method | Path                                               | Назначение                   |
| ------ | -------------------------------------------------- | ---------------------------- |
| GET    | `/api/v1/admin/orders`                             | Очередь заказов              |
| GET    | `/api/v1/admin/orders/{orderId}`                   | Детали заказа                |
| PATCH  | `/api/v1/admin/orders/{orderId}/status`            | Смена статуса                |
| POST   | `/api/v1/admin/orders/{orderId}/confirm-payment`   | Ручное подтверждение         |
| POST   | `/api/v1/admin/orders/{orderId}/reprint`           | Зафиксировать перепечатку    |
| GET    | `/api/v1/admin/projects/{projectId}`               | Revision/preflight/render    |
| GET    | `/api/v1/admin/render-jobs/{renderJobId}/download` | Короткая signed download URL |
| GET    | `/api/v1/admin/custom-order-requests`              | Очередь заявок               |
| PATCH  | `/api/v1/admin/custom-order-requests/{requestId}`  | Статус/менеджер/расчёт       |

Любая admin mutation создаёт `AuditEvent` с actor, action, entity, before/after
summary, requestId и временем. Секреты, OTP, полные signed URL и содержимое
фотографий в audit payload не записываются.

## 17. Модель данных верхнего уровня

### Identity

- `User`;
- `UserContact`;
- `AuthChallenge`;
- `Session`;
- `UserConsent`.

### Catalog

- `CatalogVersion`;
- `Product`;
- `ProductOption`;
- `Theme`;
- `Template`;
- `Layout`;
- `ProductionConstraint`;
- `PriceRule`.

### Project

- `Project` — mutable metadata и status;
- `ProjectRevision` — immutable `BookDocument` snapshot;
- `ProjectApproval` — immutable связь user + revision + checklist;
- `ValidationIssue` и `PreflightRun`;
- `Asset` и `AssetDerivative`;
- `RenderJob`.

### Commerce

- `PriceQuote` и `PriceQuoteItem`;
- `Order` и `OrderItem`;
- `Payment`;
- `Delivery`;
- `PartnerCode`;
- `CustomOrderRequest`.

### Operations

- `AuditEvent`;
- `BackgroundJob` или связь с внешней очередью;
- `ReprintCase`.

Ключевые связи:

- User 1—N Project;
- Project 1—N ProjectRevision;
- Project 1—N Asset;
- ProjectRevision 0—N PreflightRun;
- ProjectRevision 0—N ProjectApproval;
- ProjectApproval 0—N RenderJob;
- ProjectApproval 0—N Order;
- Order 1—N Payment;
- Order 1—1 Delivery snapshot.

## 18. Background jobs

Первый backend должен поддержать асинхронные jobs для:

- thumbnail/preview generation;
- HEIC conversion после отдельного spike;
- image metadata extraction;
- preflight, если он не укладывается в короткий HTTP request;
- print PDF render;
- cleanup по retention policy;
- уведомлений после согласования канала.

Общие требования:

- job имеет ID, status, progress, attempt count, timestamps и safe error code;
- retry ограничен и использует exponential backoff;
- повтор не создаёт дубликат производственного файла;
- poisoned job уходит в failed/dead-letter состояние;
- frontend получает только публичный status и безопасную ошибку;
- backend metrics фиксируют очередь, duration, retries и failure rate.

AI analysis/generation jobs не входят в первый этап.

## 19. Безопасность и конфиденциальность

- Object-level authorization на каждом project, revision, asset, approval,
  order и payment.
- Непредсказуемые public IDs.
- Закрытый bucket; публичные постоянные URL оригиналов запрещены.
- Короткоживущие signed URL с минимальными правами.
- Проверка MIME, extension, размера, image decode и при необходимости antivirus.
- Rate limiting auth, upload session, price quote, checkout и admin endpoints.
- Шифрование трафика и шифрование storage/database на уровне инфраструктуры.
- PII и signed URLs маскируются в логах.
- Backend/provider errors не передаются пользователю напрямую.
- Admin actions аудируются.
- Фотографии не используются для обучения AI без отдельного явного согласия.
- Пользователь может удалить проект и запросить удаление аккаунта.
- Рекомендуемый срок удаления оригиналов — 30 дней после завершения заказа,
  если производство и законодательство не требуют другого.
- Производственный PDF может иметь другой retention, который нужно утвердить
  юридически и операционно.

## 20. Нефункциональные требования

Начальные цели, которые уточняются после нагрузки:

- p95 обычного read API без фоновых задач — до 500 мс внутри региона хостинга;
- p95 mutation без внешнего провайдера — до 1 с;
- API не проксирует большие оригиналы;
- max JSON request для документа определяется после реального fixture;
- timeout обычного frontend API сейчас 30 секунд;
- долгие операции всегда возвращают job и не держат HTTP соединение;
- health/readiness endpoints доступны инфраструктуре, не содержат секретов;
- requestId проходит через API, worker и внешние интеграции;
- structured logs и metrics не зависят от конкретного frontend monitor;
- backup и restore базы проверяются до beta;
- миграции базы выполняются backward-compatible способом при rolling deploy.

## 21. Contract и integration testing

### Обязательные проверки

- OpenAPI проходит lint/validation.
- Examples валидируются против схем.
- Backend contract tests прогоняют success и документированные ошибки.
- MSW fixtures валидируются против тех же схем.
- `BookDocument` valid/invalid fixtures используются обеими командами.
- Autosave retry не создаёт две revisions для одного `clientMutationId`.
- Stale `baseRevisionId` возвращает 409 и не теряет server/local версии.
- Повтор order/payment с одним idempotency key не создаёт дубликат.
- Истёкший upload URL обновляется без потери asset/local file mapping.
- Чужие project/asset/order ID не раскрывают данные.
- Когда webhook входит в scope, его нельзя подделать browser-запросом.

### Интеграционный smoke flow

1. Запросить и подтвердить test OTP.
2. Получить session и CSRF token.
3. Получить catalog version и price quote.
4. Создать project.
5. Получить upload instructions, загрузить fixture, завершить asset.
6. Сохранить document revision.
7. Получить preflight и approval.
8. Создать render job и дождаться success.
9. Создать order и manual payment attempt.
10. Подтвердить payment через test operator.
11. Получить order со статусом `paid`.
12. Отдельно проверить provider webhook, когда он войдёт в scope.

## 22. Параллельный backend roadmap

### B0. Решения и инфраструктура

- [x] Provisional stack и структуру репозитория зафиксировать в
      `backend-stack.md`; ratification Backend owner остаётся обязательным.
- [x] Выбрать PostgreSQL 17, Prisma Migrate и disposable test database.
- [x] Выбрать S3-compatible adapter и MinIO для local/test; production provider
      остаётся отдельным privacy/commercial решением.
- [x] Выбрать BullMQ/Redis для render и media workers, не подключать раньше B3.
- [x] Зафиксировать границы local, test, staging и production environments.
- [x] Настроить startup config/secrets boundaries, structured logs, requestId и
      health checks; production secret provider остаётся deployment gate.
- [x] Не подключать AI-инфраструктуру.

### B1. Shared schemas и persistence foundation

- [ ] Совместно принять `BookDocumentV1` JSON Schema после frontend P1.
- [ ] Совместно принять `BookCommandV1` JSON Schema после frontend P2.
- [x] Спроектировать и проверить Project/Revision optimistic concurrency:
      immutable rows, canonical request hash, serializable transaction и
      conditional latest-revision update.
- [x] Синхронизировать valid/invalid shared fixtures с source commit metadata;
      independent backend validator проходит structural vectors.
- [x] Подготовить initial Prisma tables/migration для identity, catalog, project
      и immutable revision.
- [ ] Зафиксировать status transition tests.

### B2. API foundation, auth и catalog

- [x] Синхронизировать OpenAPI 3.1 и проверить его независимым backend lint.
- [x] Реализовать error envelope, bounded MVP project list и project-create
      idempotency.
- [x] Реализовать local/test phone auth challenge/session/CSRF; production SMS
      provider остаётся gate перед staging.
- [x] Реализовать versioned catalog read API для референсного продукта.
- [x] Реализовать provisional price quote с тестовыми правилами.
- [x] Реализовать project list/create/get и document autosave.
- [x] Пройти backend contract tests со всеми frontend HTTP examples и
      structural BookDocument/BookCommand fixtures.
- [x] Пройти browser smoke с `VITE_ENABLE_MOCKS=false`: login → create →
      editor → autosave.

### B3. Assets

- [x] Signed upload instructions для JPEG/PNG.
- [x] Complete/renew/list и идемпотентный upload batch.
- [ ] Delete asset.
- [x] Object-level authorization и запрет чужих asset references в revision.
- [x] Trusted JPEG/PNG dimensions и private signed preview оригинала как
      временный integration bridge.
- [ ] Generated thumbnail job и отдельный HEIC spike.
- [ ] Cleanup и retention.
- [x] Retry/actual-expiry integration test с local MinIO.

### B4. Preflight, approval и render

- [x] Authoritative BookDocument validation.
- [x] Preflight issues с точной ссылкой на spread/element.
- [x] Immutable approval.
- [x] Pre-M0 HTTP gate для auth/ownership/approval/profile без создания job.
- [x] Immutable `PrintProfileV1` contract, validation и content-derived version.
- [ ] Render queue и status.
- [ ] Print PDF storage и admin signed download.
- [ ] Retry без потери approval.

### B5. Orders и payment

- [ ] Price quote revalidation.
- [ ] Order snapshot и idempotent creation.
- [ ] Manual/static QR и operator confirmation для beta.
- [ ] Payment adapter/webhook только после отдельного scope decision.
- [ ] Отдельные order/payment state machines.
- [ ] Delivery snapshot.
- [ ] Polling read model.

### B6. Operator API и beta hardening

- [ ] Admin role guard и audit.
- [ ] Order/custom request queues.
- [ ] Status, manual payment, reprint.
- [ ] Rate limits, retention jobs, backups и restore test.
- [ ] Полный integration smoke flow.
- [ ] Нагрузочная проверка upload session, autosave и polling.

### B7. AI — заблокировано до production-gate конструктора

До выполнения frontend P13 и реальных тестовых заказов backend не создаёт:

- AI request endpoints;
- LLM integration;
- computer vision pipeline за пределами базовой технической обработки;
- AI command generation;
- prompt storage.

## 23. Синхронизация milestone frontend/backend

| Milestone | Frontend backlog   | Backend | Общий артефакт                             |
| --------- | ------------------ | ------- | ------------------------------------------ |
| M0        | P0                 | B0      | ProductSpec inputs, print proof            |
| M1        | P1–P2              | B0–B1   | Book schemas, fixtures, concurrency        |
| M2        | P3–P4, части P5–P9 | B2 prep | OpenAPI slice, MSW, walking skeleton       |
| M3        | P6, P12            | B2–B3   | Auth, catalog, project, upload integration |
| M4        | P5, P7, P12        | B4      | Preflight, approval, print render          |
| M5        | P8, P10, P12       | B5–B6   | Quote, order, manual payment, operator     |
| M6        | Остаток P5–P13     | B6      | Public hardening и второй product gate     |
| M7        | P14                | B7      | Future AI через существующие commands      |

## 24. Definition of Ready для подключения endpoint

Endpoint можно интегрировать с frontend, если:

1. Он есть в OpenAPI.
2. Request/response и enum не содержат `any`/неописанный object.
3. Есть success example.
4. Есть документированные validation/auth/conflict ошибки.
5. Определены idempotency и retry semantics.
6. Определены права доступа.
7. MSW handler и backend implementation используют один контракт.
8. Backend contract tests проходят.
9. Неизвестно только содержимое, которое действительно является opaque.

## 25. Открытые решения, требующие владельца бизнеса/backend

- [ ] Реальные физические характеристики двух книг.
- [ ] Точные ограничения файла и общий лимит фотографий.
- [ ] Backend stack и hosting region.
- [ ] OTP/SMS и email provider для Кыргызстана.
- [ ] Payment/QR provider и доступность webhook/sandbox.
- [ ] Production origin, cookie domain и окончательная CSRF-схема.
- [ ] Object storage provider и data residency.
- [ ] PDF/render technology и цветовой pipeline.
- [ ] Retention оригиналов, PDF и audit records.
- [ ] Правила фискального чека, возврата и отмены.
- [ ] Юридические версии privacy/offer/return policy.
- [ ] Контакты, адрес самовывоза и реальные delivery zones.

Пока решение открыто, frontend и backend используют явно помеченное mock-значение
и не выдают его за production-данные.

## 26. Текущая точка backend

Текущий backend-этап: **B4 authoritative preflight/approval завершён для frozen
review slice**. Формальное `BACKEND_READY` всё ещё требует named-owner
ratification, immutable commits и production-origin/provider решений.

Backend уже реализовал:

- локальную инфраструктуру, identity/session и общий error/requestId слой;
- catalog, project/revision persistence и autosave concurrency;
- upload-batch/complete/renew и asset-list read model по frozen contract;
- прямой browser PUT в MinIO, trusted JPEG/PNG dimensions и private preview;
- authoritative BookDocument validation, targeted preflight issues и immutable
  approval с обязательным повтором после новой revision;
- DRAFT render create/read boundary с проверкой ownership и approval: до M0
  возвращает profile gate и не создаёт job/queue;
- immutable print-profile domain contract с activation guard; production
  instance и catalog linkage отсутствуют до M0;
- disposable PostgreSQL integration environment и no-mock browser smoke до
  approval/reapproval.

Следующая backend-работа внутри B4 — открыть уже исполнимую HTTP-границу после
спецификации M0: заполнить и привязать approved `PrintProfileV1`, создать golden
PDF, а затем реализовать настоящий DRAFT print-render lifecycle. Очередь worker
добавляется только вместе с настоящим render job, не заранее.

Первая HTTP-группа внутренне заморожена Product Owner, но backend не должен
считать `BookDocument` persistence и catalog bundle готовыми до review JSON
Schema/OpenAPI и прохождения acceptance checklist.

Следующий общий contract milestone:

> Получить утверждённую производственную геометрию M0, заменить mock
> `renderProfileVersion`, затем реализовать уже описанный render lifecycle,
> golden PDF и закрытое хранение без потери существующего approval.
