-- CreateEnum
CREATE TYPE "grading_system" AS ENUM ('SCA', 'ETHIOPIAN', 'COLOMBIAN', 'BRAZILIAN', 'KENYAN', 'CUSTOM');

-- CreateEnum
CREATE TYPE "grade_classification" AS ENUM ('SPECIALTY_GRADE', 'PREMIUM_GRADE', 'EXCHANGE_GRADE', 'BELOW_STANDARD', 'OFF_GRADE');

-- CreateTable
CREATE TABLE "green_bean_gradings" (
    "id" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    "gradingSystem" "grading_system" NOT NULL DEFAULT 'SCA',
    "primaryDefects" INTEGER NOT NULL DEFAULT 0,
    "secondaryDefects" INTEGER NOT NULL DEFAULT 0,
    "fullDefectEquivalents" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "defectBreakdown" JSONB NOT NULL DEFAULT '[]',
    "screenSizeDistribution" JSONB,
    "averageScreenSize" DOUBLE PRECISION,
    "uniformityPercentage" DOUBLE PRECISION,
    "moistureContent" DOUBLE PRECISION,
    "waterActivity" DOUBLE PRECISION,
    "bulkDensity" DOUBLE PRECISION,
    "colorScore" INTEGER,
    "uniformityScore" INTEGER,
    "grade" TEXT,
    "classification" "grade_classification",
    "qualityScore" DOUBLE PRECISION,
    "gradedBy" TEXT,
    "gradedAt" TIMESTAMP(3),
    "certifiedBy" TEXT,
    "certificationDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "green_bean_gradings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "green_bean_gradings_sampleId_key" ON "green_bean_gradings"("sampleId");

-- AddForeignKey
ALTER TABLE "green_bean_gradings" ADD CONSTRAINT "green_bean_gradings_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "samples"("id") ON DELETE CASCADE ON UPDATE CASCADE;
