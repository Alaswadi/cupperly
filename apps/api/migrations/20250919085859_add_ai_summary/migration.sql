-- AlterTable
ALTER TABLE "public"."session_samples" ADD COLUMN     "aiGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "aiSummary" TEXT;
