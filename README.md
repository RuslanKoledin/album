# Photobook

Монорепозиторий веб-сервиса создания и заказа фотокниг для Бишкека.

Текущий продукт — сайт с понятным пошаговым выбором книги и ограниченным ручным
конструктором. Мобильное приложение и Telegram не входят в scope. AI будет
добавляться после готовности ручного сценария и производственного контура: он
должен собирать книгу из тех же проверенных макетов, настроек и команд, которые
доступны пользователю в конструкторе.

## Структура

- `photobook-front` — React 19 frontend, конструктор и нормативные
  API-контракты;
- `photobook-back` — NestJS modular monolith, PostgreSQL и S3-compatible
  storage;
- `docs` — общая карта документации и процесс проверки крупных задач;
- `photobook-final-spec-and-plan.md` — продуктовая концепция и итоговое ТЗ;
- `competitor-analysis-mixbook.md` — анализ Mixbook.

Frontend и backend являются отдельными pnpm-проектами со своими lock-файлами.
Git-репозиторий один — в корне `photobook`.

## Требования

- Node.js 24;
- pnpm 11.5+;
- Docker Compose для PostgreSQL и MinIO.

## Локальный запуск

Backend:

```bash
cd photobook-back
pnpm install
pnpm contracts:sync
pnpm docker:up
pnpm prisma:generate
pnpm prisma:migrate --name init
pnpm seed:reference
pnpm storage:bootstrap
pnpm dev
```

API доступен по адресу `http://localhost:4000`.

Frontend во втором терминале:

```bash
cd photobook-front
pnpm install
cp .env.example .env
pnpm dev
```

Frontend по умолчанию может работать с локальным MSW API. Переключение на
реальный backend настраивается значениями из
`photobook-front/.env.example`.

## Проверка

Полная проверка каждой части:

```bash
cd photobook-front && pnpm check
cd ../photobook-back && pnpm check
```

Во время разработки используются более быстрые targeted-команды:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Интеграционные database tests backend запускаются отдельно:

```bash
cd photobook-back
pnpm test:database
```

## Документация

Единая карта источников истины находится в
[`docs/README.md`](docs/README.md).

Основные точки входа:

- frontend: [`photobook-front/README.md`](photobook-front/README.md);
- backend: [`photobook-back/README.md`](photobook-back/README.md);
- текущий порядок работ:
  [`photobook-front/docs/planning/roadmap.md`](photobook-front/docs/planning/roadmap.md);
- текущий frontend scope:
  [`photobook-front/docs/planning/frontend-backlog.md`](photobook-front/docs/planning/frontend-backlog.md);
- backend scope и статус:
  [`photobook-front/docs/engineering/backend.md`](photobook-front/docs/engineering/backend.md);
- wire-контракты:
  [`photobook-front/docs/api/README.md`](photobook-front/docs/api/README.md).

Корневые инструкции для Codex находятся в [`AGENTS.md`](AGENTS.md). Внутри
frontend и backend действуют дополнительные локальные инструкции.
