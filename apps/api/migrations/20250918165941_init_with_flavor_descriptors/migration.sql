-- CreateEnum
CREATE TYPE "public"."user_role" AS ENUM ('ADMIN', 'MANAGER', 'CUPPER', 'VIEWER');

-- CreateEnum
CREATE TYPE "public"."subscription_status" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID');

-- CreateEnum
CREATE TYPE "public"."subscription_plan" AS ENUM ('STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."invitation_status" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "public"."processing_method" AS ENUM ('WASHED', 'NATURAL', 'HONEY', 'SEMI_WASHED', 'WET_HULLED', 'ANAEROBIC', 'CARBONIC_MACERATION', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."roast_level" AS ENUM ('LIGHT', 'MEDIUM_LIGHT', 'MEDIUM', 'MEDIUM_DARK', 'DARK', 'FRENCH', 'ITALIAN');

-- CreateEnum
CREATE TYPE "public"."scoring_system" AS ENUM ('SCA', 'COE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."session_status" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."participant_role" AS ENUM ('CUPPER', 'HEAD_JUDGE', 'OBSERVER');

-- CreateEnum
CREATE TYPE "public"."flavor_category" AS ENUM ('POSITIVE', 'NEGATIVE');

-- CreateTable
CREATE TABLE "public"."organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "subdomain" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "subscriptionStatus" "public"."subscription_status" NOT NULL DEFAULT 'TRIAL',
    "subscriptionPlan" "public"."subscription_plan" NOT NULL DEFAULT 'STARTER',
    "trialEndsAt" TIMESTAMP(3),
    "subscriptionEndsAt" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "organizationId" TEXT NOT NULL,
    "role" "public"."user_role" NOT NULL DEFAULT 'CUPPER',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "public"."user_role" NOT NULL DEFAULT 'CUPPER',
    "token" TEXT NOT NULL,
    "status" "public"."invitation_status" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."samples" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT,
    "origin" TEXT NOT NULL,
    "region" TEXT,
    "farm" TEXT,
    "producer" TEXT,
    "variety" TEXT,
    "altitude" INTEGER,
    "processingMethod" "public"."processing_method",
    "harvestDate" TIMESTAMP(3),
    "roaster" TEXT,
    "roastDate" TIMESTAMP(3),
    "roastLevel" "public"."roast_level",
    "moisture" DOUBLE PRECISION,
    "density" DOUBLE PRECISION,
    "screenSize" TEXT,
    "notes" TEXT,
    "imageUrl" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "samples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cupping_templates" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "scoringSystem" "public"."scoring_system" NOT NULL DEFAULT 'SCA',
    "maxScore" INTEGER NOT NULL DEFAULT 100,
    "categories" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cupping_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cupping_sessions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "templateId" TEXT,
    "blindTasting" BOOLEAN NOT NULL DEFAULT true,
    "allowComments" BOOLEAN NOT NULL DEFAULT true,
    "requireCalibration" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."session_status" NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "settings" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cupping_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session_participants" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "public"."participant_role" NOT NULL DEFAULT 'CUPPER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isCalibrated" BOOLEAN NOT NULL DEFAULT false,
    "calibratedAt" TIMESTAMP(3),

    CONSTRAINT "session_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session_samples" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "isBlind" BOOLEAN NOT NULL DEFAULT true,
    "blindCode" TEXT,
    "grindSize" TEXT,
    "waterTemp" DOUBLE PRECISION,
    "brewRatio" TEXT,
    "steepTime" INTEGER,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_samples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."scores" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "sessionSampleId" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "scores" JSONB NOT NULL,
    "aroma" DOUBLE PRECISION,
    "flavor" DOUBLE PRECISION,
    "aftertaste" DOUBLE PRECISION,
    "acidity" DOUBLE PRECISION,
    "body" DOUBLE PRECISION,
    "balance" DOUBLE PRECISION,
    "sweetness" DOUBLE PRECISION,
    "cleanliness" DOUBLE PRECISION,
    "uniformity" DOUBLE PRECISION,
    "overall" DOUBLE PRECISION,
    "defects" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "privateNotes" TEXT,
    "voiceNotes" TEXT,
    "voiceFileUrl" TEXT,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "isSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."flavor_descriptors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "public"."flavor_category" NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flavor_descriptors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."score_flavor_descriptors" (
    "id" TEXT NOT NULL,
    "scoreId" TEXT NOT NULL,
    "flavorDescriptorId" TEXT NOT NULL,
    "intensity" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "score_flavor_descriptors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "public"."organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_domain_key" ON "public"."organizations"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_subdomain_key" ON "public"."organizations"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_stripeCustomerId_key" ON "public"."organizations"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "public"."invitations"("token");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_email_organizationId_key" ON "public"."invitations"("email", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "session_participants_sessionId_userId_key" ON "public"."session_participants"("sessionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_samples_sessionId_sampleId_key" ON "public"."session_samples"("sessionId", "sampleId");

-- CreateIndex
CREATE UNIQUE INDEX "session_samples_sessionId_position_key" ON "public"."session_samples"("sessionId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "scores_sessionId_sampleId_userId_key" ON "public"."scores"("sessionId", "sampleId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "flavor_descriptors_name_organizationId_key" ON "public"."flavor_descriptors"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "score_flavor_descriptors_scoreId_flavorDescriptorId_key" ON "public"."score_flavor_descriptors"("scoreId", "flavorDescriptorId");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invitations" ADD CONSTRAINT "invitations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."samples" ADD CONSTRAINT "samples_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cupping_templates" ADD CONSTRAINT "cupping_templates_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cupping_templates" ADD CONSTRAINT "cupping_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cupping_sessions" ADD CONSTRAINT "cupping_sessions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cupping_sessions" ADD CONSTRAINT "cupping_sessions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cupping_sessions" ADD CONSTRAINT "cupping_sessions_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."cupping_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_participants" ADD CONSTRAINT "session_participants_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."cupping_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_participants" ADD CONSTRAINT "session_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_samples" ADD CONSTRAINT "session_samples_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."cupping_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_samples" ADD CONSTRAINT "session_samples_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "public"."samples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scores" ADD CONSTRAINT "scores_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."cupping_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scores" ADD CONSTRAINT "scores_sessionSampleId_fkey" FOREIGN KEY ("sessionSampleId") REFERENCES "public"."session_samples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scores" ADD CONSTRAINT "scores_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "public"."samples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scores" ADD CONSTRAINT "scores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."flavor_descriptors" ADD CONSTRAINT "flavor_descriptors_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."flavor_descriptors" ADD CONSTRAINT "flavor_descriptors_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."score_flavor_descriptors" ADD CONSTRAINT "score_flavor_descriptors_scoreId_fkey" FOREIGN KEY ("scoreId") REFERENCES "public"."scores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."score_flavor_descriptors" ADD CONSTRAINT "score_flavor_descriptors_flavorDescriptorId_fkey" FOREIGN KEY ("flavorDescriptorId") REFERENCES "public"."flavor_descriptors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
