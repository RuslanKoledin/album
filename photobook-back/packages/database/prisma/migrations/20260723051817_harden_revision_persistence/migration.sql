/*
  Warnings:

  - A unique constraint covering the columns `[content_hash]` on the table `catalog_versions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[latest_revision_id]` on the table `projects` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[approved_revision_id]` on the table `projects` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `content_hash` to the `catalog_versions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "catalog_versions" ADD COLUMN     "content_hash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "project_revisions" ADD COLUMN     "request_hash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "catalog_versions_content_hash_key" ON "catalog_versions"("content_hash");

-- CreateIndex
CREATE UNIQUE INDEX "projects_latest_revision_id_key" ON "projects"("latest_revision_id");

-- CreateIndex
CREATE UNIQUE INDEX "projects_approved_revision_id_key" ON "projects"("approved_revision_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_approved_revision_id_fkey" FOREIGN KEY ("approved_revision_id") REFERENCES "project_revisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_latest_revision_id_fkey" FOREIGN KEY ("latest_revision_id") REFERENCES "project_revisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_revisions" ADD CONSTRAINT "project_revisions_base_revision_id_fkey" FOREIGN KEY ("base_revision_id") REFERENCES "project_revisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_revisions" ADD CONSTRAINT "project_revisions_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
