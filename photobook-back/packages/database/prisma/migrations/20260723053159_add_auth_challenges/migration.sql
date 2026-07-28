-- CreateTable
CREATE TABLE "auth_challenges" (
    "id" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "contact_hash" TEXT NOT NULL,
    "requester_hash" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "resend_available_at" TIMESTAMPTZ(3) NOT NULL,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "consumed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "auth_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auth_challenges_contact_hash_created_at_idx" ON "auth_challenges"("contact_hash", "created_at");

-- CreateIndex
CREATE INDEX "auth_challenges_requester_hash_created_at_idx" ON "auth_challenges"("requester_hash", "created_at");
