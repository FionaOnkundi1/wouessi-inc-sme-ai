import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { buildPreviewUrl, buildPublishUrl } from "../utils/urls.js";
import {
  assertResourceAccess,
  getRequestPrincipal,
  requireSignedIn
} from "../middleware/auth.js";
import { claimDraftForUser } from "../services/draftOwnership.js";

export const sitesRouter = Router();

sitesRouter.get("/:siteId", async (req, res, next) => {
  try {
    const identifier = req.params.siteId;
    const website = await prisma.website.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }]
      },
      include: {
        business: true,
        session: true
      }
    });

    if (!website) {
      throw new AppError(404, "Draft was not found.");
    }
    assertResourceAccess(website.session, getRequestPrincipal(req));

    res.json({
      siteId: website.id,
      slug: website.slug,
      status: website.status,
      businessData: website.business,
      templateId: website.templateId,
      styleTokens: website.styleTokens,
      siteContent: {
        ...(website.siteContent as Record<string, unknown>),
        slug: website.slug
      },
      seo: website.seo,
      previewUrl: buildPreviewUrl(website.id),
      publishUrl: website.status === "published" ? buildPublishUrl(website.slug) : null,
      createdAt: website.createdAt,
      publishedAt: website.publishedAt
    });
  } catch (error) {
    next(error);
  }
});

sitesRouter.post("/:siteId/claim", async (req, res, next) => {
  try {
    const principal = getRequestPrincipal(req);
    const userId = requireSignedIn(principal);
    const result = await claimDraftForUser(req.params.siteId, userId, principal.claimToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
