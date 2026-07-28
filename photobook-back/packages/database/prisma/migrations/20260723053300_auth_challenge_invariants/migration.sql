ALTER TABLE "auth_challenges"
ADD CONSTRAINT "auth_challenges_attempt_count_nonnegative"
CHECK ("attempt_count" >= 0);

ALTER TABLE "auth_challenges"
ADD CONSTRAINT "auth_challenges_resend_before_expiry"
CHECK ("resend_available_at" <= "expires_at");
