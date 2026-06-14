import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import {
  extractBusinessDataRequestSchema,
  generateSeoRequestSchema,
  generateSiteRequestSchema,
  publishSiteRequestSchema,
  regenerateSectionRequestSchema
} from "../schemas/api.js";
import { businessDataSchema, type BusinessData } from "../schemas/business.js";
import { answersToConversationText } from "../services/answers.js";
import { extractBusinessData } from "../services/ai/extraction.js";
import { selectTemplateAndStyle } from "../services/ai/templateSelection.js";
import { generateSeoMetadata } from "../services/seo.js";
import { buildGeneratedSiteContent } from "../services/siteBuilder.js";
import { buildPreviewUrl } from "../utils/urls.js";
import { uniqueSlug } from "../utils/slug.js";
import { regenerateSection } from "../services/ai/sectionRegeneration.js";
import {
  assertResourceAccess,
  createOwnership,
  getRequestPrincipal,
  requireSignedIn,
  type RequestPrincipal
} from "../middleware/auth.js";
import { publishOwnedSite } from "../services/publishing.js";

export const aiRouter = Router();

aiRouter.post("/extract-business-data", async (req, res, next) => {
  try {
    const body = extractBusinessDataRequestSchema.parse(req.body);
    const principal = getRequestPrincipal(req);
    let session = body.sessionId
      ? await prisma.session.findUnique({ where: { id: body.sessionId } })
      : null;

    if (body.sessionId) {
      if (!session) throw new AppError(404, "Draft was not found.");
      assertResourceAccess(session, principal);
    }

    const conversationText = resolveConversationText(body, session?.conversationText);
    const result = await extractBusinessData(conversationText);
    let claimToken: string | null = null;

    if (!session) {
      const ownership = createOwnership(principal);
      session = await prisma.session.create({
        data: {
          status: "answers_submitted",
          rawAnswers: body.answers ?? {},
          conversationText,
          ownerId: ownership.ownerId,
          claimTokenHash: ownership.claimTokenHash,
          claimTokenExpiresAt: ownership.claimTokenExpiresAt
        }
      });
      claimToken = ownership.claimToken;
    }

    const business = await prisma.business.upsert({
      where: { sessionId: session.id },
      update: {
        ...toBusinessRecord(result.data),
        ownerId: session.ownerId
      },
      create: {
        sessionId: session.id,
        ownerId: session.ownerId,
        ...toBusinessRecord(result.data)
      }
    });

    await prisma.session.update({
      where: { id: session.id },
      data: { status: "business_extracted" }
    });

    res.json({
      sessionId: session.id,
      businessId: business.id,
      businessData: result.data,
      claimToken,
      ai: {
        source: result.source,
        warnings: result.errors ?? []
      }
    });
  } catch (error) {
    next(error);
  }
});

aiRouter.post("/generate-site", async (req, res, next) => {
  try {
    const body = generateSiteRequestSchema.parse(req.body);
    const { sessionId, businessId, businessData, ownerId, claimToken } = await resolveBusinessData(
      body,
      getRequestPrincipal(req)
    );
    const templateResult = await selectTemplateAndStyle(businessData);
    const seo = generateSeoMetadata(businessData);
    const siteContent = buildGeneratedSiteContent(businessData, templateResult.data, seo);
    const slug = uniqueSlug(siteContent.slug);

    const website = await prisma.website.create({
      data: {
        sessionId,
        businessId,
        ownerId,
        slug,
        status: "preview",
        templateId: templateResult.data.selectedTemplate,
        styleTokens: templateResult.data,
        siteContent,
        seo
      }
    });

    await prisma.session.update({
      where: { id: sessionId },
      data: { status: "site_generated" }
    });

    res.status(201).json({
      siteId: website.id,
      businessData,
      templateId: website.templateId,
      styleTokens: templateResult.data,
      siteContent: { ...siteContent, slug },
      seo,
      previewUrl: buildPreviewUrl(website.id),
      publishUrl: null,
      claimToken,
      ai: {
        source: templateResult.source,
        warnings: templateResult.errors ?? []
      }
    });
  } catch (error) {
    next(error);
  }
});

aiRouter.post("/generate-seo", async (req, res, next) => {
  try {
    const body = generateSeoRequestSchema.parse(req.body);
    const businessData = await resolveBusinessDataForSeo(body, getRequestPrincipal(req));
    const seo = generateSeoMetadata(businessData);

    if (body.websiteId) {
      await prisma.website.update({
        where: { id: body.websiteId },
        data: { seo }
      });
    }

    res.json({ businessData, seo });
  } catch (error) {
    next(error);
  }
});

aiRouter.post("/publish-site", async (req, res, next) => {
  try {
    const body = publishSiteRequestSchema.parse(req.body);
    const ownerId = requireSignedIn(getRequestPrincipal(req));
    res.json(await publishOwnedSite(body.siteId, ownerId));
  } catch (error) {
    next(error);
  }
});

aiRouter.post("/regenerate-section", async (req, res, next) => {
  try {
    const body = regenerateSectionRequestSchema.parse(req.body);
    const website = await prisma.website.findUnique({
      where: { id: body.siteId },
      include: { session: true }
    });
    if (!website) throw new AppError(404, "Draft was not found.");
    assertResourceAccess(website.session, getRequestPrincipal(req));

    const result = await regenerateSection(body.sectionId, body.answers, body.siteData);

    res.json({
      patch: result.data,
      ai: {
        source: result.source,
        warnings: result.errors ?? []
      }
    });
  } catch (error) {
    next(error);
  }
});

function resolveConversationText(body: {
  sessionId?: string;
  answers?: unknown;
  conversationText?: string;
}, storedConversationText?: string | null): string {
  if (body.conversationText) return body.conversationText;
  if (body.answers) return answersToConversationText(body.answers as never);
  if (!storedConversationText) {
    throw new AppError(404, "Session conversation text was not found.");
  }
  return storedConversationText;
}

async function resolveBusinessData(body: {
  sessionId?: string;
  businessData?: BusinessData;
}, principal: RequestPrincipal): Promise<{
  sessionId: string;
  businessId: string;
  businessData: BusinessData;
  ownerId: string | null;
  claimToken: string | null;
}> {
  if (body.sessionId && body.businessData) {
    const session = await prisma.session.findUnique({
      where: { id: body.sessionId }
    });
    if (!session) {
      throw new AppError(404, "Draft was not found.");
    }
    assertResourceAccess(session, principal);

    const business = await prisma.business.upsert({
      where: { sessionId: session.id },
      update: {
        ...toBusinessRecord(body.businessData),
        ownerId: session.ownerId
      },
      create: {
        sessionId: session.id,
        ownerId: session.ownerId,
        ...toBusinessRecord(body.businessData)
      }
    });

    return {
      sessionId: session.id,
      businessId: business.id,
      businessData: body.businessData,
      ownerId: session.ownerId,
      claimToken: session.ownerId ? null : principal.claimToken
    };
  }

  if (body.businessData) {
    const ownership = createOwnership(principal);
    const session = await prisma.session.create({
      data: {
        status: "business_extracted",
        ownerId: ownership.ownerId,
        claimTokenHash: ownership.claimTokenHash,
        claimTokenExpiresAt: ownership.claimTokenExpiresAt
      }
    });
    const business = await prisma.business.create({
      data: {
        sessionId: session.id,
        ownerId: ownership.ownerId,
        ...toBusinessRecord(body.businessData)
      }
    });
    return {
      sessionId: session.id,
      businessId: business.id,
      businessData: body.businessData,
      ownerId: ownership.ownerId,
      claimToken: ownership.claimToken
    };
  }

  const business = await prisma.business.findUnique({
    where: { sessionId: body.sessionId },
    include: { session: true }
  });

  if (!business) {
    throw new AppError(404, "Draft was not found.");
  }
  assertResourceAccess(business.session, principal);

  return {
    sessionId: business.sessionId,
    businessId: business.id,
    businessData: fromBusinessRecord(business),
    ownerId: business.session.ownerId,
    claimToken: null
  };
}

async function resolveBusinessDataForSeo(body: {
  sessionId?: string;
  websiteId?: string;
  businessData?: BusinessData;
}, principal: RequestPrincipal): Promise<BusinessData> {
  if (body.websiteId) {
    const website = await prisma.website.findUnique({
      where: { id: body.websiteId },
      include: { business: true, session: true }
    });
    if (!website) throw new AppError(404, "Draft was not found.");
    assertResourceAccess(website.session, principal);
    return body.businessData ?? fromBusinessRecord(website.business);
  }

  if (body.businessData) return body.businessData;

  const business = await prisma.business.findUnique({
    where: { sessionId: body.sessionId },
    include: { session: true }
  });
  if (!business) throw new AppError(404, "Draft was not found.");
  assertResourceAccess(business.session, principal);
  return fromBusinessRecord(business);
}

function toBusinessRecord(data: BusinessData) {
  return {
    businessName: data.businessName,
    businessType: data.businessType,
    productsOrServices: data.productsOrServices,
    location: data.location,
    targetCustomers: data.targetCustomers,
    uniqueSellingPoint: data.uniqueSellingPoint,
    websiteVibe: data.websiteVibe,
    extraFeatures: data.extraFeatures,
    tagline: data.tagline,
    shortDescription: data.shortDescription,
    contactHint: data.contactHint,
    competitorReference: data.competitorReference,
    missingFields: data.missingFields,
    confidence: data.confidence
  };
}

function fromBusinessRecord(record: unknown): BusinessData {
  return businessDataSchema.parse(record);
}
