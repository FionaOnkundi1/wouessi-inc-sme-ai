import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { buildPreviewUrl, buildPublishUrl } from "../utils/urls.js";
import {
  assertResourceAccess,
  getRequestPrincipal,
  requireSignedIn
} from "../middleware/auth.js";
import { claimDraftForUser } from "../services/draftOwnership.js";
import { updateSiteRequestSchema } from "../schemas/api.js";
import { publishOwnedSite, unpublishOwnedSite } from "../services/publishing.js";

export const sitesRouter = Router();

sitesRouter.get("/", async (req, res, next) => {
  try {
    const ownerId = requireSignedIn(getRequestPrincipal(req));
    const websites = await prisma.website.findMany({
      where: { ownerId },
      orderBy: { updatedAt: "desc" },
      include: { business: true }
    });

    res.json({
      sites: websites.map((website) => {
        const siteContent = website.siteContent as Record<string, unknown>;
        return {
          siteId: website.id,
          name: readContentString(siteContent, "name", website.business.businessName),
          tagline: readContentString(siteContent, "tagline", website.business.tagline),
          slug: website.slug,
          status: website.status,
          templateId: website.templateId,
          previewUrl: buildPreviewUrl(website.id),
          publishUrl: website.status === "published" ? buildPublishUrl(website.slug) : null,
          createdAt: website.createdAt,
          updatedAt: website.updatedAt,
          publishedAt: website.publishedAt
        };
      })
    });
  } catch (error) {
    next(error);
  }
});

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

sitesRouter.post("/:siteId/publish", async (req, res, next) => {
  try {
    const ownerId = requireSignedIn(getRequestPrincipal(req));
    res.json(await publishOwnedSite(req.params.siteId, ownerId));
  } catch (error) {
    next(error);
  }
});

sitesRouter.post("/:siteId/unpublish", async (req, res, next) => {
  try {
    const ownerId = requireSignedIn(getRequestPrincipal(req));
    res.json(await unpublishOwnedSite(req.params.siteId, ownerId));
  } catch (error) {
    next(error);
  }
});

sitesRouter.patch("/:siteId", async (req, res, next) => {
  try {
    const body = updateSiteRequestSchema.parse(req.body);
    const existingWebsite = await prisma.website.findUnique({
      where: { id: req.params.siteId },
      include: { session: true }
    });

    if (!existingWebsite) {
      throw new AppError(404, "Draft was not found.");
    }
    assertResourceAccess(existingWebsite.session, getRequestPrincipal(req));

    const website = await prisma.website.update({
      where: { id: existingWebsite.id },
      data: { siteContent: removeClientOnlyFields(body.siteContent) as Prisma.InputJsonObject }
    });

    res.json({
      siteId: website.id,
      status: website.status,
      siteContent: website.siteContent,
      updatedAt: website.updatedAt
    });
  } catch (error) {
    next(error);
  }
});

sitesRouter.delete("/:siteId", async (req, res, next) => {
  try {
    const ownerId = requireSignedIn(getRequestPrincipal(req));
    const result = await prisma.website.deleteMany({
      where: {
        id: req.params.siteId,
        ownerId
      }
    });

    if (result.count === 0) {
      throw new AppError(404, "Draft was not found.");
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

function removeClientOnlyFields(siteContent: Record<string, unknown>) {
  const {
    claimToken: _claimToken,
    owned: _owned,
    siteId: _siteId,
    sessionId: _sessionId,
    ...persistedContent
  } = siteContent;

  return persistedContent;
}

function readContentString(
  siteContent: Record<string, unknown>,
  key: string,
  fallback: string
) {
  const value = siteContent[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}
