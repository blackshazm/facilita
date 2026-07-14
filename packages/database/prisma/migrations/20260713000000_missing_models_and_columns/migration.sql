-- P0-3: Bring the database schema in line with packages/database/prisma/schema.prisma
-- Covers models, enums, schemas, columns, indexes and FKs that were missing from the
-- initial two migrations (20260502011739_init_catalog_matching and 20260502011903_init).
-- Idempotent: every statement uses IF NOT EXISTS so it is safe to run against either
-- a fresh database or the dev Neon DB where the tables already exist via `prisma db push`.

-- Re-create the GIST spatial index that was dropped by 20260502011903_init.
-- The index is required for the PostGIS proximity queries performed by the matching module.
CREATE INDEX IF NOT EXISTS "ProviderLocation_location_idx"
  ON "matching"."ProviderLocation" USING GIST ("location");

-- ============================================================================
-- Schemas missing from the initial migration
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS "geo";
CREATE SCHEMA IF NOT EXISTS "analytics";
CREATE SCHEMA IF NOT EXISTS "audit";

-- ============================================================================
-- Enums missing from the initial migration
-- ============================================================================
DO $$ BEGIN
  CREATE TYPE "identity"."ProviderTier" AS ENUM ('BRONZE', 'PRATA', 'OURO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "payments"."PaymentMethod" AS ENUM ('CARD', 'PIX');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "payments"."PaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'PAID', 'REFUNDED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "payments"."TransactionType" AS ENUM ('CREDIT', 'DEBIT', 'FROZEN', 'CANCEL', 'PROMO_CREDIT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "payments"."PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'PENDING_APPROVAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "evidence"."EvidenceType" AS ENUM ('BEFORE', 'AFTER', 'DURING', 'DISPUTE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "disputes"."DisputeStatus" AS ENUM ('OPEN', 'RESOLVED', 'CLOSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- geo.City
-- ============================================================================
CREATE TABLE IF NOT EXISTS "geo"."City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ibgeCode" TEXT,
    "state" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "City_slug_key" ON "geo"."City"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "City_ibgeCode_key" ON "geo"."City"("ibgeCode");

-- ============================================================================
-- geo.Neighborhood
-- ============================================================================
CREATE TABLE IF NOT EXISTS "geo"."Neighborhood" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ibgeCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Neighborhood_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Neighborhood_slug_key" ON "geo"."Neighborhood"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Neighborhood_ibgeCode_key" ON "geo"."Neighborhood"("ibgeCode");
CREATE INDEX IF NOT EXISTS "Neighborhood_cityId_idx" ON "geo"."Neighborhood"("cityId");

DO $$ BEGIN
  ALTER TABLE "geo"."Neighborhood"
    ADD CONSTRAINT "Neighborhood_cityId_fkey"
    FOREIGN KEY ("cityId") REFERENCES "geo"."City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- identity.User: missing columns + referral self-relation
-- ============================================================================
ALTER TABLE "identity"."User"
  ADD COLUMN IF NOT EXISTS "inviteCode" TEXT,
  ADD COLUMN IF NOT EXISTS "invitedById" TEXT,
  ADD COLUMN IF NOT EXISTS "referralCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "referralLimit" INTEGER NOT NULL DEFAULT 200;

CREATE UNIQUE INDEX IF NOT EXISTS "User_inviteCode_key" ON "identity"."User"("inviteCode");
CREATE INDEX IF NOT EXISTS "User_invitedById_idx" ON "identity"."User"("invitedById");

DO $$ BEGIN
  ALTER TABLE "identity"."User"
    ADD CONSTRAINT "User_invitedById_fkey"
    FOREIGN KEY ("invitedById") REFERENCES "identity"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- identity.ProviderProfile: missing columns + serviceZones m:n
-- ============================================================================
ALTER TABLE "identity"."ProviderProfile"
  ADD COLUMN IF NOT EXISTS "pagarmeRecipientId" TEXT,
  ADD COLUMN IF NOT EXISTS "tier" "identity"."ProviderTier" NOT NULL DEFAULT 'BRONZE',
  ADD COLUMN IF NOT EXISTS "fraudReason" TEXT,
  ADD COLUMN IF NOT EXISTS "isFlagged" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "bankAccount" TEXT,
  ADD COLUMN IF NOT EXISTS "bankAccountDigit" TEXT,
  ADD COLUMN IF NOT EXISTS "bankAccountType" TEXT,
  ADD COLUMN IF NOT EXISTS "bankBranch" TEXT,
  ADD COLUMN IF NOT EXISTS "bankBranchDigit" TEXT,
  ADD COLUMN IF NOT EXISTS "bankCode" TEXT,
  ADD COLUMN IF NOT EXISTS "bankDataHash" TEXT,
  ADD COLUMN IF NOT EXISTS "bankDataUpdatedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "ProviderProfile_pagarmeRecipientId_key"
  ON "identity"."ProviderProfile"("pagarmeRecipientId");

-- m:n Provider <-> Neighborhood ("ProviderToNeighborhood")
CREATE TABLE IF NOT EXISTS "_ProviderToNeighborhood" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "_ProviderToNeighborhood_AB_unique"
  ON "_ProviderToNeighborhood"("A", "B");
CREATE INDEX IF NOT EXISTS "_ProviderToNeighborhood_B_index"
  ON "_ProviderToNeighborhood"("B");

DO $$ BEGIN
  ALTER TABLE "_ProviderToNeighborhood"
    ADD CONSTRAINT "_ProviderToNeighborhood_A_fkey"
    FOREIGN KEY ("A") REFERENCES "identity"."ProviderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "_ProviderToNeighborhood"
    ADD CONSTRAINT "_ProviderToNeighborhood_B_fkey"
    FOREIGN KEY ("B") REFERENCES "geo"."Neighborhood"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- identity.KycSubmission: missing columns + drop old single-doc column
-- The initial migration created "documentUrl" — schema.prisma now uses
-- documentFrontUrl (required) + documentBackUrl (optional) + rejectionReason.
-- ============================================================================
DO $$
BEGIN
  ALTER TABLE "identity"."KycSubmission"
    ADD COLUMN IF NOT EXISTS "documentFrontUrl" TEXT,
    ADD COLUMN IF NOT EXISTS "documentBackUrl" TEXT,
    ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;

  -- Backfill the new NOT NULL column from the legacy column if it exists and is nullable.
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'identity' AND table_name = 'KycSubmission'
      AND column_name = 'documentUrl' AND is_nullable = 'YES'
  ) THEN
    UPDATE "identity"."KycSubmission"
      SET "documentFrontUrl" = COALESCE("documentFrontUrl", "documentUrl")
      WHERE "documentFrontUrl" IS NULL;

    ALTER TABLE "identity"."KycSubmission"
      ALTER COLUMN "documentFrontUrl" SET NOT NULL;

    ALTER TABLE "identity"."KycSubmission" DROP COLUMN IF EXISTS "documentUrl";
  END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- ============================================================================
-- identity.UserDevice
-- ============================================================================
CREATE TABLE IF NOT EXISTS "identity"."UserDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pushToken" TEXT NOT NULL,
    "deviceId" TEXT,
    "platform" TEXT,
    "lastLogin" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDevice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserDevice_pushToken_key" ON "identity"."UserDevice"("pushToken");
CREATE INDEX IF NOT EXISTS "UserDevice_userId_idx" ON "identity"."UserDevice"("userId");

DO $$ BEGIN
  ALTER TABLE "identity"."UserDevice"
    ADD CONSTRAINT "UserDevice_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "identity"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- identity.AuditLog
-- ============================================================================
CREATE TABLE IF NOT EXISTS "identity"."AuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- catalog: cityServiceCode + serviceCode on Service; m:n Category <-> City
-- ============================================================================
ALTER TABLE "catalog"."Service"
  ADD COLUMN IF NOT EXISTS "cityServiceCode" TEXT,
  ADD COLUMN IF NOT EXISTS "serviceCode" TEXT;

CREATE TABLE IF NOT EXISTS "_CategoryToCity" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "_CategoryToCity_AB_unique" ON "_CategoryToCity"("A", "B");
CREATE INDEX IF NOT EXISTS "_CategoryToCity_B_index" ON "_CategoryToCity"("B");

DO $$ BEGIN
  ALTER TABLE "_CategoryToCity"
    ADD CONSTRAINT "_CategoryToCity_A_fkey"
    FOREIGN KEY ("A") REFERENCES "catalog"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "_CategoryToCity"
    ADD CONSTRAINT "_CategoryToCity_B_fkey"
    FOREIGN KEY ("B") REFERENCES "geo"."City"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- orders.Order: missing geo columns + FKs to Evidence / Dispute / Payment
-- ============================================================================
ALTER TABLE "orders"."Order"
  ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- ============================================================================
-- payments.Wallet
-- ============================================================================
CREATE TABLE IF NOT EXISTS "payments"."Wallet" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "balance" BIGINT NOT NULL DEFAULT 0,
    "pendingBalance" BIGINT NOT NULL DEFAULT 0,
    "promoBalance" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Wallet_providerId_key" ON "payments"."Wallet"("providerId");

-- ============================================================================
-- payments.WalletTransaction
-- ============================================================================
CREATE TABLE IF NOT EXISTS "payments"."WalletTransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" "payments"."TransactionType" NOT NULL,
    "amount" BIGINT NOT NULL,
    "orderId" TEXT,
    "externalId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "WalletTransaction_walletId_idx" ON "payments"."WalletTransaction"("walletId");

DO $$ BEGIN
  ALTER TABLE "payments"."WalletTransaction"
    ADD CONSTRAINT "WalletTransaction_walletId_fkey"
    FOREIGN KEY ("walletId") REFERENCES "payments"."Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- payments.Payment
-- ============================================================================
CREATE TABLE IF NOT EXISTS "payments"."Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "externalId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "splitAmount" DECIMAL(65,30),
    "method" "payments"."PaymentMethod" NOT NULL,
    "status" "payments"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionLog" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cbsAmount" DECIMAL(65,30),
    "ibsAmount" DECIMAL(65,30),
    "invoiceId" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Payment_externalId_key" ON "payments"."Payment"("externalId");
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_invoiceId_key" ON "payments"."Payment"("invoiceId");
CREATE INDEX IF NOT EXISTS "Payment_orderId_idx" ON "payments"."Payment"("orderId");

DO $$ BEGIN
  ALTER TABLE "payments"."Payment"
    ADD CONSTRAINT "Payment_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "orders"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- payments.Invoice
-- ============================================================================
CREATE TABLE IF NOT EXISTS "payments"."Invoice" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "externalId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "xmlUrl" TEXT,
    "pdfUrl" TEXT,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "taxAmount" DECIMAL(65,30) NOT NULL,
    "ibsAmount" DECIMAL(65,30),
    "cbsAmount" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_externalId_key" ON "payments"."Invoice"("externalId");

-- Payment.invoiceId FK added after Invoice exists.
DO $$ BEGIN
  ALTER TABLE "payments"."Payment"
    ADD CONSTRAINT "Payment_invoiceId_fkey"
    FOREIGN KEY ("invoiceId") REFERENCES "payments"."Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- payments.PayoutBatch
-- ============================================================================
CREATE TABLE IF NOT EXISTS "payments"."PayoutBatch" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "totalAmount" BIGINT NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "processedCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "lastHeartbeat" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayoutBatch_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- payments.Payout
-- ============================================================================
CREATE TABLE IF NOT EXISTS "payments"."Payout" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "fee" BIGINT NOT NULL DEFAULT 0,
    "status" "payments"."PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "externalId" TEXT,
    "bankDataHash" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "batchId" TEXT,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Payout_externalId_key" ON "payments"."Payout"("externalId");
CREATE INDEX IF NOT EXISTS "Payout_batchId_idx" ON "payments"."Payout"("batchId");

DO $$ BEGIN
  ALTER TABLE "payments"."Payout"
    ADD CONSTRAINT "Payout_batchId_fkey"
    FOREIGN KEY ("batchId") REFERENCES "payments"."PayoutBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- evidence.Evidence
-- ============================================================================
CREATE TABLE IF NOT EXISTS "evidence"."Evidence" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "evidence"."EvidenceType" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Evidence_orderId_idx" ON "evidence"."Evidence"("orderId");

DO $$ BEGIN
  ALTER TABLE "evidence"."Evidence"
    ADD CONSTRAINT "Evidence_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "orders"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- disputes.Dispute
-- ============================================================================
CREATE TABLE IF NOT EXISTS "disputes"."Dispute" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "disputes"."DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "outcome" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Dispute_orderId_idx" ON "disputes"."Dispute"("orderId");

DO $$ BEGIN
  ALTER TABLE "disputes"."Dispute"
    ADD CONSTRAINT "Dispute_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "orders"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- analytics.DailyMetric
-- ============================================================================
CREATE TABLE IF NOT EXISTS "analytics"."DailyMetric" (
    "date" TIMESTAMP(3) NOT NULL,
    "gmv" BIGINT NOT NULL DEFAULT 0,
    "ordersCount" INTEGER NOT NULL DEFAULT 0,
    "matchesCount" INTEGER NOT NULL DEFAULT 0,
    "revenue" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "DailyMetric_pkey" PRIMARY KEY ("date")
);

-- ============================================================================
-- audit.FinancialAuditLog
-- ============================================================================
CREATE TABLE IF NOT EXISTS "audit"."FinancialAuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialAuditLog_pkey" PRIMARY KEY ("id")
);
