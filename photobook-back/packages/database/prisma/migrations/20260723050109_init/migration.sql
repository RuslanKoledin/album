-- CreateEnum
CREATE TYPE "project_status" AS ENUM ('draft', 'awaiting_upload', 'uploading', 'editing', 'ready_for_review', 'approved', 'archived', 'deleted');

-- CreateEnum
CREATE TYPE "asset_status" AS ENUM ('pending_upload', 'uploading', 'uploaded', 'processing', 'ready', 'failed', 'deleted');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'ru',
    "profile_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "csrf_token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "invalidated_at" TIMESTAMPTZ(3),
    "last_seen_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_versions" (
    "id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "published_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalog_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "catalog_version_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "project_status" NOT NULL DEFAULT 'draft',
    "category_tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "latest_revision_id" TEXT,
    "approved_revision_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_revisions" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "revision_number" INTEGER NOT NULL,
    "base_revision_id" TEXT,
    "client_mutation_id" TEXT,
    "document" JSONB NOT NULL,
    "document_hash" TEXT NOT NULL,
    "created_by_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "client_file_id" TEXT NOT NULL,
    "status" "asset_status" NOT NULL DEFAULT 'pending_upload',
    "original_file_name" TEXT NOT NULL,
    "object_key" TEXT NOT NULL,
    "media_type" TEXT NOT NULL,
    "expected_size" BIGINT NOT NULL,
    "stored_size" BIGINT,
    "etag" TEXT,
    "sha256" TEXT,
    "pixel_width" INTEGER,
    "pixel_height" INTEGER,
    "captured_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_records" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "request_hash" TEXT NOT NULL,
    "status_code" INTEGER NOT NULL,
    "response" JSONB NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idempotency_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_expires_at_idx" ON "sessions"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "projects_owner_id_updated_at_idx" ON "projects"("owner_id", "updated_at");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "project_revisions_project_id_created_at_idx" ON "project_revisions"("project_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "project_revisions_project_id_revision_number_key" ON "project_revisions"("project_id", "revision_number");

-- CreateIndex
CREATE UNIQUE INDEX "project_revisions_project_id_client_mutation_id_key" ON "project_revisions"("project_id", "client_mutation_id");

-- CreateIndex
CREATE UNIQUE INDEX "assets_object_key_key" ON "assets"("object_key");

-- CreateIndex
CREATE INDEX "assets_project_id_status_idx" ON "assets"("project_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "assets_project_id_client_file_id_key" ON "assets"("project_id", "client_file_id");

-- CreateIndex
CREATE INDEX "idempotency_records_expires_at_idx" ON "idempotency_records"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_records_scope_key_key" ON "idempotency_records"("scope", "key");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_catalog_version_id_fkey" FOREIGN KEY ("catalog_version_id") REFERENCES "catalog_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_revisions" ADD CONSTRAINT "project_revisions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
