-- Add nullable ownership so legacy records remain hidden until explicitly claimed.
ALTER TABLE "Session"
ADD COLUMN "ownerId" TEXT,
ADD COLUMN "claimTokenHash" TEXT,
ADD COLUMN "claimTokenExpiresAt" TIMESTAMP(3);

ALTER TABLE "Business"
ADD COLUMN "ownerId" TEXT;

ALTER TABLE "Website"
ADD COLUMN "ownerId" TEXT;

CREATE INDEX "Session_ownerId_idx" ON "Session"("ownerId");
CREATE INDEX "Business_ownerId_idx" ON "Business"("ownerId");
CREATE INDEX "Website_ownerId_idx" ON "Website"("ownerId");
