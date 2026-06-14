import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { buildPublishUrl } from "../utils/urls.js";

export const publicSitesRouter = Router();

publicSitesRouter.get("/:slug", async (req, res, next) => {
  try {
    const website = await prisma.website.findFirst({
      where: {
        slug: req.params.slug,
        status: "published"
      }
    });

    if (
      !website ||
      !website.publishedTemplateId ||
      !website.publishedStyleTokens ||
      !website.publishedSiteContent ||
      !website.publishedSeo
    ) {
      throw new AppError(404, "Published website was not found.");
    }

    res.json({
      slug: website.slug,
      status: website.status,
      templateId: website.publishedTemplateId,
      styleTokens: website.publishedStyleTokens,
      siteContent: {
        ...(website.publishedSiteContent as Record<string, unknown>),
        slug: website.slug
      },
      seo: website.publishedSeo,
      publishedAt: website.publishedAt,
      publicUrl: buildPublishUrl(website.slug)
    });
  } catch (error) {
    next(error);
  }
});
