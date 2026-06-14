-- Published sites use stable snapshots so later draft edits stay private until republished.
ALTER TABLE "Website"
ADD COLUMN "publishedTemplateId" TEXT,
ADD COLUMN "publishedStyleTokens" JSONB,
ADD COLUMN "publishedSiteContent" JSONB,
ADD COLUMN "publishedSeo" JSONB;
