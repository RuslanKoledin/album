---
id: PXX-TXX
title: Краткое измеримое название
status: BACKLOG
owner: Codex Builder
human_reviewer: TBD
reviewer_thread: TBD
depends_on: []
blocks: []
spec_sections: []
requirement_ids: []
adr_refs: []
branch: task/PXX-TXX-short-slug
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# PXX-TXX — Название задачи

## 1. Результат

Одно предложение: какой наблюдаемый результат должен появиться после выполнения.

## 2. Зачем это нужно

Какую пользовательскую, бизнес- или техническую проблему решает задача.

## 3. Предусловия / Definition of Ready

- [ ] Все зависимости имеют статус `DONE` или `VERIFIED`.
- [ ] Все связанные `TBD` закрыты решениями.
- [ ] Указаны разделы ТЗ и requirement IDs.
- [ ] Определены API/данные/UX-контракты, если задача от них зависит.
- [ ] Подготовлены fixtures, тестовые данные или макеты.
- [ ] Задача не содержит скрытого второго функционала.

## 4. In scope

- конкретный пункт;
- конкретный пункт.

## 5. Out of scope

- явно исключённый функционал;
- соседние улучшения, которые запрещено делать «заодно».

## 6. Пользовательский / системный сценарий

1. ...
2. ...
3. ...

## 7. Бизнес-правила и ограничения

- правило;
- лимит;
- права доступа;
- обработка ошибок;
- security/privacy ограничение.

## 8. Контракты

### API

- Endpoint / method / auth / idempotency / errors.

### Данные

- Сущности, поля, миграции, snapshots, версии.

### UI

- Состояния: loading, empty, success, validation error, server error, retry, offline.

## 9. Acceptance criteria

- [ ] AC-01: Given ..., when ..., then ...
- [ ] AC-02: Given ..., when ..., then ...
- [ ] AC-03: Негативный сценарий.
- [ ] AC-04: Проверка прав доступа.
- [ ] AC-05: Проверка повторного запроса / retry, если применимо.

## 10. Обязательные тесты

- [ ] Unit tests.
- [ ] Integration/contract tests.
- [ ] Negative authorization tests.
- [ ] E2E or UI test, если применимо.
- [ ] Mobile/responsive check, если применимо.
- [ ] Regression test for fixed defects.

## 11. Разрешённая область изменений

- `path/or/module/**`

## 12. Запрещённые изменения

- `docs/spec/MASTER_SPEC.md`;
- соседние модули без необходимости;
- изменение утверждённых контрактов без ADR;
- закрытие новых TBD.

## 13. Implementation plan

Заполняется Codex до начала изменения кода.

1. TBD
2. TBD

## 14. Rollback

Как безопасно отключить или откатить изменение.

## 15. Completion evidence

Заполняется Codex.

### Изменённые файлы

- TBD

### Команды и результаты

| Команда | Exit code | Результат |
|---|---:|---|
| TBD | TBD | TBD |

### Доказательства acceptance criteria

| AC | Доказательство |
|---|---|
| AC-01 | TBD |

### Артефакты

- screenshot / video / generated PDF / report path.

### Ограничения и незавершённые пункты

- отсутствуют / перечислить.

## 16. Human verification checklist

- [ ] Продукт запущен локально или на staging.
- [ ] Основной сценарий проверен вручную.
- [ ] Негативные сценарии проверены.
- [ ] UI проверен на согласованных viewport.
- [ ] Diff просмотрен.
- [ ] Нет скрытых изменений вне scope.
- [ ] Логи не содержат секретов или пользовательских данных.

## 17. Review log

| Дата | Reviewer | Результат | Отчёт |
|---|---|---|---|
| TBD | TBD | TBD | TBD |
