ALTER TABLE "preflight_runs"
ADD CONSTRAINT "preflight_runs_issues_array"
CHECK (jsonb_typeof("issues") = 'array'),
ADD CONSTRAINT "preflight_runs_completion_state"
CHECK (
  (
    "status" IN ('succeeded', 'failed')
    AND "completed_at" IS NOT NULL
  )
  OR (
    "status" IN ('queued', 'running')
    AND "completed_at" IS NULL
  )
);

ALTER TABLE "approvals"
ADD CONSTRAINT "approvals_checklist_object"
CHECK (jsonb_typeof("checklist") = 'object'),
ADD CONSTRAINT "approvals_request_hash_not_empty"
CHECK (length("request_hash") > 0);
