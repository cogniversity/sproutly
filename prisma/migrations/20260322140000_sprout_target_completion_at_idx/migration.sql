-- Prisma schema @@index([targetCompletionAt]) on Sprout; IF NOT EXISTS is safe when index was created earlier out-of-band.
CREATE INDEX IF NOT EXISTS "Sprout_targetCompletionAt_idx" ON "Sprout"("targetCompletionAt");
