-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('clipper', 'funder', 'admin');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'suspended', 'pending_verification');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('draft', 'active', 'paused', 'exhausted', 'ended', 'archived');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('video', 'vod');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('pending_review', 'rejected', 'approved_awaiting_views', 'views_verified', 'payout_triggered', 'paid');

-- CreateEnum
CREATE TYPE "WalletLedgerType" AS ENUM ('top_up', 'campaign_escrow', 'escrow_release', 'payout_debit', 'refund', 'adjustment');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('pending', 'triggered', 'paid', 'failed');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('email', 'in_app');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('pending', 'sent', 'failed');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clipper_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "phone" TEXT,
    "bank_name" TEXT,
    "account_number" TEXT,
    "paystack_recipient_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clipper_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funder_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funder_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "funder_profile_id" TEXT NOT NULL,
    "balance_kobo" BIGINT NOT NULL DEFAULT 0,
    "escrow_kobo" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_ledger_entries" (
    "id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "type" "WalletLedgerType" NOT NULL,
    "amount_kobo" BIGINT NOT NULL,
    "balance_after_kobo" BIGINT NOT NULL,
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "campaign_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "funder_profile_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source_type" "SourceType" NOT NULL,
    "asset_url" TEXT,
    "asset_storage_key" TEXT,
    "best_moments" TEXT,
    "description" TEXT NOT NULL,
    "platforms" TEXT[],
    "cpm_kobo" INTEGER NOT NULL,
    "budget_kobo" BIGINT NOT NULL,
    "remaining_kobo" BIGINT NOT NULL,
    "total_views" INTEGER NOT NULL DEFAULT 0,
    "clip_count" INTEGER NOT NULL DEFAULT 0,
    "image_url" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'draft',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_participations" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "clipper_id" TEXT NOT NULL,
    "verification_code" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_participations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clip_submissions" (
    "id" TEXT NOT NULL,
    "participation_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "clipper_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "post_url" TEXT NOT NULL,
    "verification_code" TEXT NOT NULL,
    "code_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'pending_review',
    "views_verified" INTEGER,
    "earnings_kobo" INTEGER,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clip_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_reviews" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "code_verified" BOOLEAN NOT NULL,
    "approved" BOOLEAN NOT NULL,
    "rejection_reason" TEXT,
    "notes" TEXT,
    "reviewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "view_verifications" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "verifier_id" TEXT NOT NULL,
    "view_count" INTEGER NOT NULL,
    "evidence_url" TEXT,
    "verified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "view_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "earning_entries" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "clipper_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "gross_kobo" INTEGER NOT NULL,
    "clipper_kobo" INTEGER NOT NULL,
    "platform_kobo" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "earning_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payout_batches" (
    "id" TEXT NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'pending',
    "total_kobo" BIGINT NOT NULL,
    "triggered_by" TEXT,
    "triggered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payout_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payout_items" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT,
    "submission_id" TEXT NOT NULL,
    "clipper_id" TEXT NOT NULL,
    "amount_kobo" INTEGER NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'pending',
    "paystack_ref" TEXT,
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payout_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_webhooks" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'paystack',
    "event_type" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'pending',
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "metadata" JSONB,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "clipper_profiles_user_id_key" ON "clipper_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "funder_profiles_user_id_key" ON "funder_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_funder_profile_id_key" ON "wallets"("funder_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_ledger_entries_reference_key" ON "wallet_ledger_entries"("reference");

-- CreateIndex
CREATE INDEX "wallet_ledger_entries_wallet_id_created_at_idx" ON "wallet_ledger_entries"("wallet_id", "created_at");

-- CreateIndex
CREATE INDEX "campaigns_status_idx" ON "campaigns"("status");

-- CreateIndex
CREATE INDEX "campaigns_funder_profile_id_idx" ON "campaigns"("funder_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_participations_verification_code_key" ON "campaign_participations"("verification_code");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_participations_campaign_id_clipper_id_key" ON "campaign_participations"("campaign_id", "clipper_id");

-- CreateIndex
CREATE INDEX "clip_submissions_status_idx" ON "clip_submissions"("status");

-- CreateIndex
CREATE INDEX "clip_submissions_campaign_id_idx" ON "clip_submissions"("campaign_id");

-- CreateIndex
CREATE UNIQUE INDEX "clip_submissions_post_url_key" ON "clip_submissions"("post_url");

-- CreateIndex
CREATE UNIQUE INDEX "submission_reviews_submission_id_key" ON "submission_reviews"("submission_id");

-- CreateIndex
CREATE UNIQUE INDEX "view_verifications_submission_id_key" ON "view_verifications"("submission_id");

-- CreateIndex
CREATE UNIQUE INDEX "earning_entries_submission_id_key" ON "earning_entries"("submission_id");

-- CreateIndex
CREATE INDEX "earning_entries_clipper_id_idx" ON "earning_entries"("clipper_id");

-- CreateIndex
CREATE UNIQUE INDEX "payout_items_submission_id_key" ON "payout_items"("submission_id");

-- CreateIndex
CREATE INDEX "payout_items_clipper_id_idx" ON "payout_items"("clipper_id");

-- CreateIndex
CREATE INDEX "payout_items_status_idx" ON "payout_items"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payment_webhooks_reference_key" ON "payment_webhooks"("reference");

-- CreateIndex
CREATE INDEX "payment_webhooks_processed_idx" ON "payment_webhooks"("processed");

-- CreateIndex
CREATE INDEX "notifications_user_id_status_idx" ON "notifications"("user_id", "status");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clipper_profiles" ADD CONSTRAINT "clipper_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funder_profiles" ADD CONSTRAINT "funder_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_funder_profile_id_fkey" FOREIGN KEY ("funder_profile_id") REFERENCES "funder_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_ledger_entries" ADD CONSTRAINT "wallet_ledger_entries_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_ledger_entries" ADD CONSTRAINT "wallet_ledger_entries_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_funder_profile_id_fkey" FOREIGN KEY ("funder_profile_id") REFERENCES "funder_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_participations" ADD CONSTRAINT "campaign_participations_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_participations" ADD CONSTRAINT "campaign_participations_clipper_id_fkey" FOREIGN KEY ("clipper_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clip_submissions" ADD CONSTRAINT "clip_submissions_participation_id_fkey" FOREIGN KEY ("participation_id") REFERENCES "campaign_participations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clip_submissions" ADD CONSTRAINT "clip_submissions_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clip_submissions" ADD CONSTRAINT "clip_submissions_clipper_id_fkey" FOREIGN KEY ("clipper_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_reviews" ADD CONSTRAINT "submission_reviews_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "clip_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_reviews" ADD CONSTRAINT "submission_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "view_verifications" ADD CONSTRAINT "view_verifications_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "clip_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "view_verifications" ADD CONSTRAINT "view_verifications_verifier_id_fkey" FOREIGN KEY ("verifier_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "earning_entries" ADD CONSTRAINT "earning_entries_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "clip_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payout_items" ADD CONSTRAINT "payout_items_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "payout_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payout_items" ADD CONSTRAINT "payout_items_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "clip_submissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

