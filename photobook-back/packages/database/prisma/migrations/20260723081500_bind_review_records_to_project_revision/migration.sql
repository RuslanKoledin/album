-- Bind every preflight run to a revision of the same project.
ALTER TABLE "preflight_runs"
DROP CONSTRAINT "preflight_runs_revision_id_fkey";

CREATE UNIQUE INDEX "project_revisions_id_project_id_key"
ON "project_revisions"("id", "project_id");

ALTER TABLE "preflight_runs"
ADD CONSTRAINT "preflight_runs_revision_id_project_id_fkey"
FOREIGN KEY ("revision_id", "project_id")
REFERENCES "project_revisions"("id", "project_id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Bind approval, preflight and approved revision to the same project/revision.
ALTER TABLE "approvals"
DROP CONSTRAINT "approvals_approved_revision_id_fkey",
DROP CONSTRAINT "approvals_preflight_run_id_fkey";

CREATE UNIQUE INDEX "preflight_runs_id_project_id_revision_id_key"
ON "preflight_runs"("id", "project_id", "revision_id");

ALTER TABLE "approvals"
ADD CONSTRAINT "approvals_approved_revision_id_project_id_fkey"
FOREIGN KEY ("approved_revision_id", "project_id")
REFERENCES "project_revisions"("id", "project_id")
ON DELETE RESTRICT
ON UPDATE CASCADE,
ADD CONSTRAINT "approvals_preflight_run_id_project_id_approved_revision_id_fkey"
FOREIGN KEY ("preflight_run_id", "project_id", "approved_revision_id")
REFERENCES "preflight_runs"("id", "project_id", "revision_id")
ON DELETE RESTRICT
ON UPDATE CASCADE;
