# Frontend Engineering Rules

Единственный обязательный источник frontend-правил Photobook. Явные решения
пользователя и продуктовые ограничения имеют приоритет. `AGENTS.md`, `README.md`,
skills, roadmap и backlog не должны копировать эти правила.

## 1. Стек и границы

- React 19, strict TypeScript, Vite и React Router Framework Mode.
- Redux Toolkit для редактируемого документа и устойчивого client state.
- RTK Query с `fetchBaseQuery` для server state.
- Tailwind CSS, Vitest, Testing Library и MSW.
- Публичные `/`, `/books` и `/help` пререндерятся; приложение работает как SPA.
- Не добавлять Next.js, Axios, TanStack Router/Query, Zustand, Ant Design, Zod,
  i18next, Sentry, AI SDK или второй state/request stack без решения
  пользователя.
- Ручное и будущее AI-редактирование используют один `BookDocument` и одни
  типизированные команды. AI не входит в текущий этап.

## 2. Архитектура

```text
app -> pages -> modules -> shared
           \-> core/book
modules ------------^  (typed commands and configuration)
```

- `app`: bootstrap, providers, routes, layouts, global integration и dev mocks.
- `pages`: meta и минимальная route-level композиция.
- `modules`: бизнес-сценарии, API endpoints, mappings, state, hooks и UI.
- `shared`: только domain-agnostic infrastructure, helpers и UI primitives.
- `core/book`: детерминированный домен без React, Redux, browser API и network.

Папки создаются по фактической ответственности:

```text
module/
  api/       # RTK Query endpoint injection
  hooks/     # orchestration, effects and handlers
  libs/      # pure functions
  model/     # types, constants, state and selectors
  mocks/     # private MSW fixtures and handlers
  ui/        # feature components
  index.ts   # intentional public API
```

Компонент отвечает за render и wiring props; hook — за orchestration; `libs` —
за чистые вычисления; `model` — за типы и state; `api` — за endpoints и DTO
mapping. Pages не содержат бизнес-логику.

## 3. Public API и импорты

- Между слоями и модулями импортировать только через public entry point:
  `@modules/editor`, `@shared/ui`, `@shared/api`, `@core/book`.
- Запрещены module deep imports и parent-relative paths (`../`, `../../`).
- Внутри одной локальной папки разрешены `./...` imports.
- Файл внутри модуля не импортирует собственный корневой barrel: это создаёт
  циклы. Для внутренних связей используются ограниченные aliases
  `@auth/api`, `@auth/model`, `@auth/libs`, `@auth/hooks`, `@auth-ui/*`, `@editor/model`,
  `@editor/libs`, `@editor/hooks`, `@editor-ui/*`, `@catalog/model` и
  `@project/model`. Они запрещены внешним потребителям.
- Page может обращаться к собственному `config` через `@pages/<Page>/config`;
  остальные слои используют только корневой public API страницы.
- Компоненты внутри `shared/ui` обращаются к sibling packages через
  `@shared-ui/*`, не через общий `@shared/ui` barrel.
- Внутри `core/book` внутренние subpackages могут импортировать друг друга как
  `@core/book/<subpackage>` через собственные barrels, чтобы не создавать
  self-cycle главного `@core/book`. За пределами `core/book` разрешён только
  публичный `@core/book`.
- Кодовые feature-папки публикуют `index.ts`; barrels содержат только
  `export * from './...'`.
- Приватные mocks/helpers не входят в production public API. Secondary entry
  points `@mocks/*` разрешены только module-owned mocks, app mock composition и
  тестам.
- Type-only dependencies оформляются через `import type`.
- `src/app/routes` и asset-only folders не требуют barrels.

## 4. State и данные

- RTK Query: users, catalog, projects, pricing, orders и remote lifecycle.
- Redux Toolkit: активный сериализуемый документ, committed history, undo/redo,
  значимая selection и save/sync state.
- React state: hover, menus, dialogs, pointer movement и незавершённый drag.
- URL: состояние, которое должно переживать navigation или быть linkable.
- `File`, `Blob`, object URL, DOM, image и canvas instances не хранятся в Redux
  или persistence payload; для них используется module-owned registry.
- Drag/resize/crop фиксирует одну команду после завершения взаимодействия, а не
  записывает каждое pointer movement в history.
- UI получает backend data через module API. Endpoints не объявляются в pages
  или components.
- OpenAPI/JSON Schema, frontend DTO, MSW и backend используют один wire-контракт.

## 5. Декомпозиция и размеры файлов

- Один `.tsx` implementation-файл содержит один основной компонент, его props
  и только маленький локальный render helper.
- Один hook-файл содержит один основной hook.
- Pure helpers, fixtures, API и orchestration не живут внутри компонента.
- Повторяющийся или самостоятельный JSX-блок становится дочерним компонентом.
- Model-файл может объединять только тесно связанные types/constants/state.

| Тип файла            |    Цель | Review | Максимум |
| -------------------- | ------: | -----: | -------: |
| Small UI component   |  80–120 |    150 |      180 |
| Feature UI component | 120–150 |    180 |      220 |
| Page/route component |  80–160 |    200 |      250 |
| Feature hook         |  60–120 |    150 |      180 |
| Pure `libs`          |  40–120 |    150 |      200 |
| RTK Query API        | 100–180 |    220 |      280 |
| Any implementation   |       — |    250 |      300 |
| Test/contract file   |       — |    300 |      350 |

Лимиты — guardrail. Файл делится раньше, если смешивает concerns или плохо
сканируется. `pnpm architecture:check` проверяет абсолютные ограничения.

## 6. TypeScript, UI и ошибки

- Object-shaped domain/props types — `interface`; unions и mapped types —
  `type`.
- Unknown external data проходит явное narrowing/validation.
- Derived state вычисляется, а не копируется в state.
- Не использовать `any` и non-null assertion для обхода реального состояния.
- Loading, empty, error, offline, unsynced, disabled и success различаются там,
  где они применимы. Пользователь не видит raw backend errors или stack traces.
- Сохранять keyboard access, visible focus, readable contrast, meaningful
  labels и essential tap targets не меньше 44 CSS px.
- Standard UI icons брать из `react-icons`; custom brand icons — из
  `@shared/ui/iconpack`. Не встраивать icon SVG, unicode arrows или emoji в
  feature components. SVG renderer книги не считается иконкой.
- Основной UI workflow — code-first и browser verification. Figma необязательна
  и используется только по запросу или для сложного stakeholder review.

## 7. Тестирование по риску

- Focused test-first обязателен для высокорисковых инвариантов и команд книги,
  undo/redo, print/pricing calculations, нетривиальной serialization,
  persistence/API mapping и bug fix.
- Reducer тестируется только при содержательных переходах состояния.
- Не писать тесты по умолчанию для статичной разметки, styles/tokens, barrels,
  очевидного config, простого endpoint wiring и framework adapters.
- Один риск проверяется на самом низком достаточном уровне. Не дублировать один
  контракт в unit, component, MSW и browser без разных рисков.
- Component test защищает важное поведение или accessibility, которое нельзя
  дешевле проверить pure-тестом или browser smoke.
- Во время разработки запускать targeted tests; полный suite — перед milestone
  или handoff.

## 8. Рабочий процесс и Definition of Done

Перед изменением:

1. Найти текущий milestone в `../planning/roadmap.md`.
2. Взять минимальный соответствующий scope из
   `../planning/frontend-backlog.md`.
3. Для backend-зависимой задачи сначала согласовать `../api` contract и
   `backend.md`, затем писать RTK Query/MSW/UI.
4. Проверить существующие module, route, state и UI patterns до новой
   dependency или abstraction.

Задача завершена, когда применимое выполнено:

1. Слои, public API, imports, file responsibilities и размеры соблюдены.
2. Данные и state находятся у правильного владельца; работа пользователя не
   теряется при recoverable failure.
3. Добавлены только тесты, оправданные риском, и пройдены targeted checks.
4. Пройдены `pnpm architecture:check`, `pnpm typecheck` и `pnpm lint`.
5. Для законченного этапа пройдён `pnpm check` и production build.
6. UI-изменения проверены в браузере на релевантных mobile/desktop размерах и
   без console errors.
7. Контракты, roadmap/backlog и постоянные решения обновлены только если
   действительно изменились.

Архитектурные исключения должны быть узкими, обоснованными и отражёнными здесь
и в audit script. Для trivial leaf component не создаётся отдельный FEATURE.md.
