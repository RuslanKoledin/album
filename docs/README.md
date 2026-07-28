# Документация Photobook

Этот файл — общая точка входа в документацию монорепозитория. Детальные правила
хранятся у той части проекта, которая ими владеет; одинаковые roadmap, статусы
и контракты в нескольких местах не создаются.

## Карта

| Область        | Источник                                                                      | Назначение                                              |
| -------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------- |
| Продукт        | [`photobook-final-spec-and-plan.md`](../photobook-final-spec-and-plan.md)     | Концепция, рынок Бишкека, MVP и отложенные возможности  |
| Исследование   | [`competitor-analysis-mixbook.md`](../competitor-analysis-mixbook.md)         | Анализ Mixbook без автоматического переноса его scope   |
| Планирование   | [`roadmap.md`](../photobook-front/docs/planning/roadmap.md)                   | Единственный интегрированный порядок milestone и gates  |
| Frontend scope | [`frontend-backlog.md`](../photobook-front/docs/planning/frontend-backlog.md) | Реализованные возможности и следующая frontend-точка    |
| Frontend       | [`frontend docs`](../photobook-front/docs/README.md)                          | Архитектура, правила, gates и API                       |
| Backend scope  | [`backend.md`](../photobook-front/docs/engineering/backend.md)                | Требования, группы контрактов и следующая backend-точка |
| Backend        | [`backend README`](../photobook-back/README.md)                               | Запуск, реализованный HTTP-срез и ADR                   |
| API            | [`API contracts`](../photobook-front/docs/api/README.md)                      | OpenAPI, JSON Schema, examples и handoff                |
| Процесс        | [`review guide`](process/review-guide.md)                                     | Усиленная приёмка крупных и рискованных задач           |
| Процесс        | [`task template`](process/task-template.md)                                   | Необязательный шаблон для отдельного task artifact      |

## Владение информацией

- Корневой `README.md` описывает проект, запуск и навигацию.
- Корневой `AGENTS.md` маршрутизирует работу в frontend или backend.
- Product spec определяет бизнес-scope.
- Интегрированный roadmap определяет порядок этапов.
- Frontend backlog и backend requirements отражают фактический прогресс.
- `photobook-front/docs/api` является единственным wire source of truth.
- Backend ADR фиксируют принятые технические решения.
- История реализации хранится в Git, а не пересказывается в отдельных status
  files.

## Когда обновлять

Документация меняется вместе с кодом только тогда, когда изменился продуктовый
scope, архитектура, контракт, значимый пользовательский flow, milestone или
внешний gate. Обычный локальный рефакторинг не требует новой записи в roadmap.

При переносе файла нужно обновить все ссылки и не оставлять вторую копию с
устаревшими правилами.
