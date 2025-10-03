/*
  Warnings:

  - The values [ETHIOPIAN,COLOMBIAN,BRAZILIAN,KENYAN,CUSTOM] on the enum `grading_system` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `colorScore` on the `green_bean_gradings` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "grading_system_new" AS ENUM ('SCA');
ALTER TABLE "green_bean_gradings" ALTER COLUMN "gradingSystem" DROP DEFAULT;
ALTER TABLE "green_bean_gradings" ALTER COLUMN "gradingSystem" TYPE "grading_system_new" USING ("gradingSystem"::text::"grading_system_new");
ALTER TYPE "grading_system" RENAME TO "grading_system_old";
ALTER TYPE "grading_system_new" RENAME TO "grading_system";
DROP TYPE "grading_system_old";
ALTER TABLE "green_bean_gradings" ALTER COLUMN "gradingSystem" SET DEFAULT 'SCA';
COMMIT;

-- AlterTable
ALTER TABLE "green_bean_gradings" DROP COLUMN "colorScore",
ADD COLUMN     "beanColorAssessment" TEXT;
