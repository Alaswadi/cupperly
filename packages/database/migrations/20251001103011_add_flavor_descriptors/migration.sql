-- CreateEnum
CREATE TYPE "flavor_category" AS ENUM ('POSITIVE', 'NEGATIVE');

-- CreateTable
CREATE TABLE "flavor_descriptors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "flavor_category" NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flavor_descriptors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "score_flavor_descriptors" (
    "id" TEXT NOT NULL,
    "scoreId" TEXT NOT NULL,
    "flavorDescriptorId" TEXT NOT NULL,
    "intensity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "score_flavor_descriptors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "flavor_descriptors_name_organizationId_key" ON "flavor_descriptors"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "score_flavor_descriptors_scoreId_flavorDescriptorId_key" ON "score_flavor_descriptors"("scoreId", "flavorDescriptorId");

-- AddForeignKey
ALTER TABLE "flavor_descriptors" ADD CONSTRAINT "flavor_descriptors_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flavor_descriptors" ADD CONSTRAINT "flavor_descriptors_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "score_flavor_descriptors" ADD CONSTRAINT "score_flavor_descriptors_scoreId_fkey" FOREIGN KEY ("scoreId") REFERENCES "scores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "score_flavor_descriptors" ADD CONSTRAINT "score_flavor_descriptors_flavorDescriptorId_fkey" FOREIGN KEY ("flavorDescriptorId") REFERENCES "flavor_descriptors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
