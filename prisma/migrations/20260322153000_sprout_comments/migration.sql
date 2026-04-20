-- CreateTable
CREATE TABLE "SproutComment" (
    "id" TEXT NOT NULL,
    "sproutId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SproutComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SproutComment_sproutId_createdAt_idx" ON "SproutComment"("sproutId", "createdAt");

-- CreateIndex
CREATE INDEX "SproutComment_authorUserId_idx" ON "SproutComment"("authorUserId");

-- AddForeignKey
ALTER TABLE "SproutComment" ADD CONSTRAINT "SproutComment_sproutId_fkey" FOREIGN KEY ("sproutId") REFERENCES "Sprout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SproutComment" ADD CONSTRAINT "SproutComment_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
