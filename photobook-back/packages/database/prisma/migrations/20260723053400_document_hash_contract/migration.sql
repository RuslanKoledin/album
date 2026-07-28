UPDATE "project_revisions"
SET "document_hash" = 'sha256:' || "document_hash"
WHERE "document_hash" NOT LIKE 'sha256:%';

ALTER TABLE "project_revisions"
ADD CONSTRAINT "project_revisions_document_hash_format"
CHECK ("document_hash" ~ '^sha256:[A-Za-z0-9._-]+$');
