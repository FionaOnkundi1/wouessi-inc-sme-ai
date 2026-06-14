import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { buildPreviewUrl, buildPublishUrl } from "../utils/urls.js";

export async function publishOwnedSite(siteId: string, ownerId: string) {
  const existingWebsite = await prisma.website.findFirst({
    where: { id: siteId, ownerId }
  });

  if (!existingWebsite) {
    throw new AppError(404, "Draft was not found.");
  }

  const website = await prisma.website.update({
    where: { id: existingWebsite.id },
    data: {
      status: "published",
      publishedTemplateId: existingWebsite.templateId,
      publishedStyleTokens: existingWebsite.styleTokens as Prisma.InputJsonValue,
      publishedSiteContent: existingWebsite.siteContent as Prisma.InputJsonValue,
      publishedSeo: existingWebsite.seo as Prisma.InputJsonValue,
      publishedAt: new Date()
    }
  });

  await prisma.session.update({
    where: { id: website.sessionId },
    data: { status: "published" }
  });

  return publishingResponse(website);
}

export async function unpublishOwnedSite(siteId: string, ownerId: string) {
  const existingWebsite = await prisma.website.findFirst({
    where: { id: siteId, ownerId }
  });

  if (!existingWebsite) {
    throw new AppError(404, "Draft was not found.");
  }

  const website = await prisma.website.update({
    where: { id: existingWebsite.id },
    data: {
      status: "preview",
      publishedAt: null
    }
  });

  await prisma.session.update({
    where: { id: website.sessionId },
    data: { status: "site_generated" }
  });

  return publishingResponse(website);
}

function publishingResponse(website: {
  id: string;
  slug: string;
  status: string;
  publishedAt: Date | null;
}) {
  return {
    siteId: website.id,
    slug: website.slug,
    status: website.status,
    previewUrl: buildPreviewUrl(website.id),
    publishUrl: website.status === "published" ? buildPublishUrl(website.slug) : null,
    publishedAt: website.publishedAt
  };
}
