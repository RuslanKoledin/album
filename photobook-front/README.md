# Photobook frontend

Веб-сервис создания и заказа фотокниг для Бишкека. Текущий этап — ограниченный
ручной конструктор на моках; AI подключается только после готовности ручного
сценария и производственного контура.

## Запуск

Требования: Node.js 22.12+ и pnpm 11.5+.

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Основные команды:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm check
```

## Стек

React 19, TypeScript, Vite, React Router Framework Mode, Redux Toolkit,
RTK Query, Tailwind CSS, Vitest и MSW.

## Структура

```text
src/app      — bootstrap, providers и route adapters
src/pages    — тонкая композиция страниц
src/modules  — пользовательские сценарии и доменные UI-модули
src/core     — независимое ядро конструктора
src/shared   — переиспользуемая инфраструктура и UI primitives
docs         — правила, планы и API-контракты
```

Архитектурные решения, текущий этап и API-документация находятся в
[индексе документации](docs/README.md). Инструкции для Codex — в
[AGENTS.md](AGENTS.md).
