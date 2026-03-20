-- AlterTable
ALTER TABLE "Plot" ADD COLUMN "timelineLabel" TEXT;

-- AlterTable
ALTER TABLE "Initiative" ADD COLUMN "timelineLabel" TEXT,
ADD COLUMN "targetCompletionAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Sprout" ADD COLUMN "timelineLabel" TEXT,
ADD COLUMN "targetCompletionAt" TIMESTAMP(3);

-- Migrate legacy horizon enum to a text label (best-effort)
UPDATE "Sprout" SET "timelineLabel" = CASE "horizon"::text
  WHEN 'DAY' THEN 'Day'
  WHEN 'WEEK' THEN 'Week'
  WHEN 'MONTH' THEN 'Month'
  WHEN 'QUARTER' THEN 'Quarter'
  WHEN 'YEAR' THEN 'Year'
  ELSE NULL
END WHERE "horizon"::text != 'NONE';

-- DropEnum / column
ALTER TABLE "Sprout" DROP COLUMN "horizon";

DROP TYPE "Horizon";
