# Photobook

Monorepo веб-сервиса создания фотокниг для Бишкека.

## Структура

- `photobook-front` — React 19, React Router, Redux Toolkit и RTK Query;
- `photobook-back` — NestJS, Fastify, PostgreSQL, Prisma и S3-compatible
  storage;
- `photobook-final-spec-and-plan.md` — продуктовая концепция и итоговое ТЗ;
- `competitor-analysis-mixbook.md` — анализ Mixbook.

Frontend и backend остаются отдельными pnpm-проектами со своими lock-файлами.

## Локальный запуск

Требования: Node.js 24, pnpm 11 и Docker Compose.

```bash
cd photobook-back
pnpm install
pnpm contracts:sync
pnpm docker:up
pnpm prisma:generate
pnpm prisma:migrate
pnpm seed:reference
pnpm storage:bootstrap
pnpm dev
```

Во втором терминале:

```bash
cd photobook-front
pnpm install
pnpm dev
```

Frontend по умолчанию работает с локальными mock API. Для интеграции с
backend используются значения из `photobook-front/.env.example`.

## Проверка

```bash
cd photobook-front && pnpm check
cd ../photobook-back && pnpm check
```

Источник wire-контрактов находится в `photobook-front/docs/api`; backend
получает синхронизированную копию командой `pnpm contracts:sync`.
