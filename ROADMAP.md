# Roadmap задач

> Порядок определяется зависимостями и release gates, а не желанием сделать самый заметный экран первым.

| ID | Задача | Статус | Зависимости | Разделы ТЗ | Файл |
|---|---|---|---|---|---|
| META-001 | Инициализировать Codex execution workflow | `READY` | — | 0, 6, 45, 47, 48, 49 | [tasks/current/META-001-initialize-execution-workflow.md](current/META-001-initialize-execution-workflow.md) |
| P00-T01 | Утвердить паспорта двух физических продуктов | `BACKLOG` | — | 6, 7, 28 | [tasks/backlog/P00-T01-product-passports.md](backlog/P00-T01-product-passports.md) |
| P00-T02 | Рассчитать unit economics заказа | `BACKLOG` | P00-T01 | 3, 25, 28 | [tasks/backlog/P00-T02-unit-economics.md](backlog/P00-T02-unit-economics.md) |
| P00-T03 | Утвердить производственный SOP и критерии брака | `BACKLOG` | P00-T01 | 28, 29, 49 | [tasks/backlog/P00-T03-production-sop.md](backlog/P00-T03-production-sop.md) |
| P00-T04 | Утвердить privacy и retention решения | `BACKLOG` | — | 38, 39 | [tasks/backlog/P00-T04-privacy-retention.md](backlog/P00-T04-privacy-retention.md) |
| P00-T05 | Выбрать платёжную схему MVP | `BACKLOG` | P00-T02 | 27 | [tasks/backlog/P00-T05-payment-decision.md](backlog/P00-T05-payment-decision.md) |
| P01-T01 | Принять ADR по технологическому стеку и структуре репозитория | `BACKLOG` | — | 35, 36, 37 | [tasks/backlog/P01-T01-stack-adr.md](backlog/P01-T01-stack-adr.md) |
| P01-T02 | Провести spike экранного и печатного renderer | `BACKLOG` | P00-T01, P01-T01 | 19, 20, 24, 35, 44 | [tasks/backlog/P01-T02-renderer-spike.md](backlog/P01-T02-renderer-spike.md) |
| P01-T03 | Провести spike resumable upload и HEIC pipeline | `BACKLOG` | P01-T01, P00-T04 | 16, 37, 38, 44 | [tasks/backlog/P01-T03-upload-heic-spike.md](backlog/P01-T03-upload-heic-spike.md) |
| P01-T04 | Создать AI benchmark и оценить стоимость | `BACKLOG` | P00-T04, P01-T01 | 17, 18, 22, 44 | [tasks/backlog/P01-T04-ai-benchmark-spike.md](backlog/P01-T04-ai-benchmark-spike.md) |
| P02-T01 | Создать scaffold репозитория | `BACKLOG` | P01-T01 | 35, 45, 47, 48 | [tasks/backlog/P02-T01-repo-scaffold.md](backlog/P02-T01-repo-scaffold.md) |
| P02-T02 | Настроить CI и quality gates | `BACKLOG` | P02-T01 | 37, 43, 48, 49 | [tasks/backlog/P02-T02-ci-quality-gates.md](backlog/P02-T02-ci-quality-gates.md) |
| P02-T03 | Настроить БД и миграции | `BACKLOG` | P02-T01 | 34, 35 | [tasks/backlog/P02-T03-database-migrations.md](backlog/P02-T03-database-migrations.md) |
| P02-T04 | Настроить object storage и очередь заданий | `BACKLOG` | P02-T01, P00-T04 | 16, 35, 37, 38 | [tasks/backlog/P02-T04-storage-queue.md](backlog/P02-T04-storage-queue.md) |
| P02-T05 | Настроить logging, metrics, tracing и audit skeleton | `BACKLOG` | P02-T01 | 32, 37, 38, 40 | [tasks/backlog/P02-T05-observability.md](backlog/P02-T05-observability.md) |
| P02-T06 | Создать auth, session и RBAC skeleton | `BACKLOG` | P02-T03 | 8, 14, 32, 38 | [tasks/backlog/P02-T06-auth-rbac-skeleton.md](backlog/P02-T06-auth-rbac-skeleton.md) |
| P03-T01 | Создать дизайн-систему и адаптивный shell | `BACKLOG` | P02-T01 | 9, 13, 37 | [tasks/backlog/P03-T01-design-system-shell.md](backlog/P03-T01-design-system-shell.md) |
| P03-T02 | Реализовать публичные страницы и каталог | `BACKLOG` | P03-T01, P00-T01, P00-T02 | 9, 13, 25 | [tasks/backlog/P03-T02-public-pages.md](backlog/P03-T02-public-pages.md) |
| P03-T03 | Реализовать OTP-авторизацию | `BACKLOG` | P02-T06 | 14, 38, 41 | [tasks/backlog/P03-T03-otp-auth.md](backlog/P03-T03-otp-auth.md) |
| P03-T04 | Реализовать гостевой brief до авторизации | `BACKLOG` | P03-T03 | 14, 15 | [tasks/backlog/P03-T04-guest-project-flow.md](backlog/P03-T04-guest-project-flow.md) |
| P04-T01 | Реализовать создание проекта и brief | `BACKLOG` | P03-T04, P00-T01 | 15, 19 | [tasks/backlog/P04-T01-project-brief.md](backlog/P04-T01-project-brief.md) |
| P04-T02 | Реализовать upload session и signed multipart upload | `BACKLOG` | P02-T04, P04-T01, P01-T03 | 16, 36, 38 | [tasks/backlog/P04-T02-signed-upload.md](backlog/P04-T02-signed-upload.md) |
| P04-T03 | Реализовать проверку и нормализацию изображений | `BACKLOG` | P04-T02, P01-T03 | 16, 38, 41 | [tasks/backlog/P04-T03-asset-normalization.md](backlog/P04-T03-asset-normalization.md) |
| P04-T04 | Реализовать библиотеку фотографий проекта | `BACKLOG` | P04-T03 | 16, 21 | [tasks/backlog/P04-T04-asset-library.md](backlog/P04-T04-asset-library.md) |
| P04-T05 | Реализовать pipeline анализа assets | `BACKLOG` | P04-T03, P01-T04 | 17, 35 | [tasks/backlog/P04-T05-asset-analysis-jobs.md](backlog/P04-T05-asset-analysis-jobs.md) |
| P05-T01 | Зафиксировать BookDocument schema v1 | `BACKLOG` | P00-T01, P01-T02 | 19, 34, 36 | [tasks/backlog/P05-T01-bookdocument-schema.md](backlog/P05-T01-bookdocument-schema.md) |
| P05-T02 | Реализовать versioned product/theme/layout catalog | `BACKLOG` | P02-T03, P05-T01 | 20, 25, 34 | [tasks/backlog/P05-T02-catalog-versioning.md](backlog/P05-T02-catalog-versioning.md) |
| P05-T03 | Реализовать экранный renderer | `BACKLOG` | P05-T01, P05-T02, P01-T02 | 20, 24, 35 | [tasks/backlog/P05-T03-screen-renderer.md](backlog/P05-T03-screen-renderer.md) |
| P05-T04 | Реализовать серверный печатный renderer | `BACKLOG` | P05-T03, P00-T01 | 20, 24, 28, 35 | [tasks/backlog/P05-T04-print-renderer.md](backlog/P05-T04-print-renderer.md) |
| P05-T05 | Реализовать validator и preflight rules | `BACKLOG` | P05-T01, P00-T01 | 20, 24, 28, 41 | [tasks/backlog/P05-T05-validator-preflight.md](backlog/P05-T05-validator-preflight.md) |
| P05-T06 | Настроить screen/PDF parity tests | `BACKLOG` | P05-T03, P05-T04 | 37, 43, 44 | [tasks/backlog/P05-T06-render-parity-tests.md](backlog/P05-T06-render-parity-tests.md) |
| P06-T01 | Реализовать shell редактора и навигацию по разворотам | `BACKLOG` | P05-T03, P04-T04 | 21 | [tasks/backlog/P06-T01-editor-shell.md](backlog/P06-T01-editor-shell.md) |
| P06-T02 | Реализовать замену фото и crop | `BACKLOG` | P06-T01, P05-T05 | 21 | [tasks/backlog/P06-T02-photo-crop.md](backlog/P06-T02-photo-crop.md) |
| P06-T03 | Реализовать редактирование текстовых блоков | `BACKLOG` | P06-T01, P05-T05 | 21 | [tasks/backlog/P06-T03-text-editing.md](backlog/P06-T03-text-editing.md) |
| P06-T04 | Реализовать смену макета разворота | `BACKLOG` | P06-T02, P05-T02 | 20, 21 | [tasks/backlog/P06-T04-layout-change.md](backlog/P06-T04-layout-change.md) |
| P06-T05 | Реализовать операции с разворотами | `BACKLOG` | P06-T01, P05-T05 | 21, 25 | [tasks/backlog/P06-T05-page-operations.md](backlog/P06-T05-page-operations.md) |
| P06-T06 | Реализовать ограниченный редактор обложки | `BACKLOG` | P06-T02, P06-T03, P00-T01 | 20, 21, 24 | [tasks/backlog/P06-T06-cover-editor.md](backlog/P06-T06-cover-editor.md) |
| P06-T07 | Реализовать autosave и optimistic concurrency | `BACKLOG` | P06-T01 | 21, 23, 37 | [tasks/backlog/P06-T07-autosave-conflicts.md](backlog/P06-T07-autosave-conflicts.md) |
| P06-T08 | Реализовать Undo/Redo и version checkpoints | `BACKLOG` | P06-T07 | 23 | [tasks/backlog/P06-T08-undo-versioning.md](backlog/P06-T08-undo-versioning.md) |
| P07-T01 | Реализовать автоматический отбор фотографий | `BACKLOG` | P04-T05, P01-T04 | 17, 18 | [tasks/backlog/P07-T01-auto-selection.md](backlog/P07-T01-auto-selection.md) |
| P07-T02 | Реализовать группировку истории | `BACKLOG` | P07-T01 | 17, 18 | [tasks/backlog/P07-T02-story-grouping.md](backlog/P07-T02-story-grouping.md) |
| P07-T03 | Реализовать первичную автоматическую сборку книги | `BACKLOG` | P07-T02, P05-T05 | 18, 19, 20 | [tasks/backlog/P07-T03-auto-book-generation.md](backlog/P07-T03-auto-book-generation.md) |
| P07-T04 | Реализовать ограниченные AI-команды редактора | `BACKLOG` | P07-T03, P06-T08 | 22, 23 | [tasks/backlog/P07-T04-ai-editor-commands.md](backlog/P07-T04-ai-editor-commands.md) |
| P07-T05 | Настроить AI benchmark и regression gate | `BACKLOG` | P07-T03, P01-T04 | 17, 18, 43, 49 | [tasks/backlog/P07-T05-ai-regression.md](backlog/P07-T05-ai-regression.md) |
| P08-T01 | Реализовать preview и переход к проблемам | `BACKLOG` | P06-T06, P05-T05 | 24 | [tasks/backlog/P08-T01-preview.md](backlog/P08-T01-preview.md) |
| P08-T02 | Реализовать неизменяемое утверждение версии | `BACKLOG` | P08-T01, P00-T04 | 23, 24, 39 | [tasks/backlog/P08-T02-immutable-approval.md](backlog/P08-T02-immutable-approval.md) |
| P08-T03 | Реализовать серверный pricing и price snapshot | `BACKLOG` | P00-T02, P05-T02, P06-T05 | 25 | [tasks/backlog/P08-T03-pricing-service.md](backlog/P08-T03-pricing-service.md) |
| P08-T04 | Реализовать checkout и идемпотентное создание заказа | `BACKLOG` | P08-T02, P08-T03 | 26, 28 | [tasks/backlog/P08-T04-checkout-order.md](backlog/P08-T04-checkout-order.md) |
| P08-T05 | Реализовать оплату и reconciliation | `BACKLOG` | P08-T04, P00-T05 | 27 | [tasks/backlog/P08-T05-payment-integration.md](backlog/P08-T05-payment-integration.md) |
| P08-T06 | Реализовать возвраты и отмены | `BACKLOG` | P08-T05, P00-T03 | 27, 28 | [tasks/backlog/P08-T06-refunds.md](backlog/P08-T06-refunds.md) |
| P08-T07 | Реализовать личный кабинет и статус заказа | `BACKLOG` | P08-T04 | 30 | [tasks/backlog/P08-T07-customer-orders.md](backlog/P08-T07-customer-orders.md) |
| P09-T01 | Реализовать административный RBAC и audit | `BACKLOG` | P02-T06, P02-T05 | 8, 32, 38 | [tasks/backlog/P09-T01-admin-rbac.md](backlog/P09-T01-admin-rbac.md) |
| P09-T02 | Реализовать очередь ручного preflight | `BACKLOG` | P08-T02, P05-T04, P09-T01 | 24, 28, 32 | [tasks/backlog/P09-T02-preflight-queue.md](backlog/P09-T02-preflight-queue.md) |
| P09-T03 | Реализовать production job и статусы | `BACKLOG` | P09-T02, P08-T05, P00-T03 | 28, 33 | [tasks/backlog/P09-T03-production-job.md](backlog/P09-T03-production-job.md) |
| P09-T04 | Реализовать quality control и reprint flow | `BACKLOG` | P09-T03, P00-T03 | 28, 32, 33 | [tasks/backlog/P09-T04-quality-reprint.md](backlog/P09-T04-quality-reprint.md) |
| P09-T05 | Реализовать самовывоз и доставку | `BACKLOG` | P09-T03 | 29, 33 | [tasks/backlog/P09-T05-delivery-pickup.md](backlog/P09-T05-delivery-pickup.md) |
| P09-T06 | Реализовать уведомления | `BACKLOG` | P03-T03, P09-T03 | 31 | [tasks/backlog/P09-T06-notifications.md](backlog/P09-T06-notifications.md) |
| P10-T01 | Провести security hardening MVP | `BACKLOG` | P09-T06 | 38, 43, 49 | [tasks/backlog/P10-T01-security-hardening.md](backlog/P10-T01-security-hardening.md) |
| P10-T02 | Реализовать retention, deletion и consent lifecycle | `BACKLOG` | P00-T04, P08-T02 | 39 | [tasks/backlog/P10-T02-privacy-lifecycle.md](backlog/P10-T02-privacy-lifecycle.md) |
| P10-T03 | Провести performance и load testing | `BACKLOG` | P09-T06 | 37, 43, 49 | [tasks/backlog/P10-T03-performance-load.md](backlog/P10-T03-performance-load.md) |
| P10-T04 | Собрать end-to-end regression suite | `BACKLOG` | P09-T06 | 42, 43, 48, 49 | [tasks/backlog/P10-T04-e2e-regression.md](backlog/P10-T04-e2e-regression.md) |
| P10-T05 | Проверить backup, restore и disaster recovery | `BACKLOG` | P02-T03, P02-T04 | 37, 43, 49 | [tasks/backlog/P10-T05-backup-restore.md](backlog/P10-T05-backup-restore.md) |
| P10-T06 | Провести закрытую beta | `BACKLOG` | P10-T01, P10-T02, P10-T03, P10-T04, P10-T05 | 3, 45, 49, 55 | [tasks/backlog/P10-T06-closed-beta.md](backlog/P10-T06-closed-beta.md) |
| P11-T01 | Подготовить production deploy и rollback runbook | `BACKLOG` | P10-T06 | 45, 49 | [tasks/backlog/P11-T01-production-runbook.md](backlog/P11-T01-production-runbook.md) |
| P11-T02 | Выполнить публичный launch gate | `BACKLOG` | P11-T01, P10-T06 | 49, 55 | [tasks/backlog/P11-T02-public-launch.md](backlog/P11-T02-public-launch.md) |
