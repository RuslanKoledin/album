-- CreateEnum
CREATE TYPE "preflight_status" AS ENUM ('queued', 'running', 'succeeded', 'failed');

-- CreateTable
CREATE TABLE "preflight_runs" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "revision_id" TEXT NOT NULL,
    "status" "preflight_status" NOT NULL,
    "issues" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(3),

    CONSTRAINT "preflight_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approvals" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "approved_revision_id" TEXT NOT NULL,
    "preflight_run_id" TEXT NOT NULL,
    "approved_by_user_id" TEXT NOT NULL,
    "checklist" JSONB NOT NULL,
    "acknowledged_warning_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "request_hash" TEXT NOT NULL,
    "approved_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approvals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "preflight_runs_project_id_revision_id_created_at_idx" ON "preflight_runs"("project_id", "revision_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "approvals_approved_revision_id_key" ON "approvals"("approved_revision_id");

-- CreateIndex
CREATE UNIQUE INDEX "approvals_preflight_run_id_key" ON "approvals"("preflight_run_id");

-- CreateIndex
CREATE INDEX "approvals_project_id_approved_at_idx" ON "approvals"("project_id", "approved_at");

-- AddForeignKey
ALTER TABLE "preflight_runs" ADD CONSTRAINT "preflight_runs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preflight_runs" ADD CONSTRAINT "preflight_runs_revision_id_fkey" FOREIGN KEY ("revision_id") REFERENCES "project_revisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_approved_revision_id_fkey" FOREIGN KEY ("approved_revision_id") REFERENCES "project_revisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_preflight_run_id_fkey" FOREIGN KEY ("preflight_run_id") REFERENCES "preflight_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
