# Документация Photobook Frontend

Это единственная точка входа в проектную документацию. Каждый документ имеет
одну ответственность; правила не должны дублироваться в `README.md`,
`AGENTS.md`, skills или backlog.

## Карта

| Раздел      | Документ                                              | Назначение                                                                             |
| ----------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Engineering | [Frontend rules](engineering/frontend.md)             | Единственный источник frontend-архитектуры, code quality, testing и Definition of Done |
| Engineering | [Backend requirements](engineering/backend.md)        | Backend-архитектура, безопасность, endpoints, jobs и интеграция                        |
| Engineering | [Backend stack](engineering/backend-stack.md)         | Provisional B0 stack, deployment units и environment boundaries                        |
| Planning    | [Delivery roadmap](planning/roadmap.md)               | Порядок milestone, gates и бизнес-решения                                              |
| Planning    | [Frontend backlog](planning/frontend-backlog.md)      | Детальный capability checklist и текущая точка продолжения                             |
| Gates       | [Gate execution](gates/README.md)                     | Статусы, процедуры и доказательства внешних проверок                                   |
| API         | [API contracts](api/README.md)                        | OpenAPI, JSON Schema, examples и статусы контрактов                                    |
| API         | [Backend handoff](api/backend-handoff.md)             | Матрица приёмки первой contract-группы                                                 |
| Product     | [Итоговое ТЗ](../../photobook-final-spec-and-plan.md) | Продукт, рынок, MVP и долгосрочная концепция                                           |

## Что читать по задаче

- Любая frontend-задача: `engineering/frontend.md`.
- Выбор следующего этапа: `planning/roadmap.md`, затем нужный раздел
  `planning/frontend-backlog.md`.
- Проведение производственной, пользовательской или backend-приёмки:
  `gates/README.md`, затем связанный протокол.
- API, auth, upload, persistence, pricing, order или jobs:
  `engineering/backend.md` и соответствующий контракт из `api/`.
- Backend scaffold или infrastructure: `engineering/backend-stack.md`, затем
  соответствующий B0/B1-раздел `engineering/backend.md`.
- Продуктовый scope или бизнес-решение: итоговое ТЗ и roadmap.
- UI или error recovery: соответствующий skill, указанный в корневом
  `AGENTS.md`, после чтения frontend-правил.

## Владение информацией

- `README.md` объясняет только назначение, запуск и структуру репозитория.
- `AGENTS.md` содержит только порядок чтения и выполнения задач.
- `engineering/frontend.md` содержит все обязательные frontend-правила.
- Roadmap определяет порядок; backlog описывает объём и прогресс.
- `api/` является источником wire-контрактов и не дублируется в планах.
- `frontend-agents-master/` — служебный bundle skills и его внутренняя wiki, а
  не второй набор проектной документации. Активный entry point указан в
  корневом `AGENTS.md`.
- История реализации хранится в Git; её не нужно пересказывать в README.

При переносе документа необходимо обновить все ссылки и не оставлять redirect-
заглушки со старыми правилами.
