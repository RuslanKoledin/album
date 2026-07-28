ALTER TABLE "project_revisions"
ADD CONSTRAINT "project_revisions_positive_number_check"
CHECK ("revision_number" > 0);

ALTER TABLE "project_revisions"
ADD CONSTRAINT "project_revisions_lineage_shape_check"
CHECK (
  (
    "revision_number" = 1
    AND "base_revision_id" IS NULL
    AND "client_mutation_id" IS NULL
    AND "request_hash" IS NULL
  )
  OR
  (
    "revision_number" > 1
    AND "base_revision_id" IS NOT NULL
    AND "client_mutation_id" IS NOT NULL
    AND "request_hash" IS NOT NULL
  )
);

ALTER TABLE "project_revisions"
ADD CONSTRAINT "project_revisions_base_is_not_self_check"
CHECK ("base_revision_id" IS NULL OR "base_revision_id" <> "id");
