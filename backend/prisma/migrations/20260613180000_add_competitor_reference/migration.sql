-- Preserve competitor/style references extracted from the business conversation.
ALTER TABLE "Business"
ADD COLUMN "competitorReference" TEXT NOT NULL DEFAULT '';
