-- CreateEnum
CREATE TYPE "SproutType" AS ENUM ('IDEA', 'FEATURE', 'BUG', 'DEBT', 'TASK');

-- AlterTable
ALTER TABLE "Sprout"
ADD COLUMN "type" "SproutType" NOT NULL DEFAULT 'IDEA';
