import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import {
  extractBusinessDataRequestSchema,
  generateSeoRequestSchema,
  generateSiteRequestSchema,
  publishSiteRequestSchema
} from "../schemas/api.js";
import { businessDataSchema, type BusinessData } from "../schemas/business.js";
import { answersToConversationText } from "../services/answers.js";
import { extractBusinessData } from "../services/ai/extraction.js";
import { selectTemplateAndStyle } from "../services/ai/templateSelection.js";
import { generateSeoMetadata } from "../services/seo.js";
import { buildGeneratedSiteContent } from "../services/siteBuilder.js";
import { buildPreviewUrl, buildPublishUrl } from "../utils/urls.js";
import { uniqueSlug } from "../utils/slug.js";

export const aiRouter = Router();

aiRouter.post("/extract-business-data", async (req, res, next) => {
  try {
    const body = extractBusinessDataRequestSchema.parse(req.body);
    const conversationText = await resolveConversationText(body);
    const result = await extractBusinessData(conversationText);

    let sessionId = body.sessionId;
    if (!sessionId) {
      const session = await prisma.session.create({
        data: {
          status: "answers_submitted",
          rawAnswers: body.answers ?? {},
          conversationText
        }
      });
      sessionId = session.id;
    }

    const business = await prisma.business.upsert({
      where: { sessionId },
      update: toBusinessRecord(result.data),
      create: {
        sessionId,
        ...toBusinessRecord(result.data)
      }
    });

    await prisma.session.update({
      where: { id: sessionId },
      data: { status: "business_extracted" }
    });

    res.json({
      sessionId,
      businessId: business.id,
      businessData: result.data,
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
    const { sessionId, businessId, businessData } = await resolveBusinessData(body);
    const templateResult = await selectTemplateAndStyle(businessData);
    const seo = generateSeoMetadata(businessData);
    const siteContent = buildGeneratedSiteContent(businessData, templateResult.data, seo);
    const slug = uniqueSlug(siteContent.slug);

    const website = await prisma.website.create({
      data: {
        sessionId,
        businessId,
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
    const businessData = await resolveBusinessDataForSeo(body);
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
    const website = await prisma.website.update({
      where: { id: body.siteId },
      data: {
        status: "published",
        publishedAt: new Date()
      }
    });

    await prisma.session.update({
      where: { id: website.sessionId },
      data: { status: "published" }
    });

    res.json({
      siteId: website.id,
      slug: website.slug,
      status: website.status,
      previewUrl: buildPreviewUrl(website.id),
      publishUrl: buildPublishUrl(website.slug)
    });
  } catch (error) {
    next(error);
  }
});

async function resolveConversationText(body: {
  sessionId?: string;
  answers?: unknown;
  conversationText?: string;
}): Promise<string> {
  if (body.conversationText) return body.conversationText;
  if (body.answers) return answersToConversationText(body.answers as never);

  const session = await prisma.session.findUnique({ where: { id: body.sessionId } });
  if (!session?.conversationText) {
    throw new AppError(404, "Session conversation text was not found.");
  }
  return session.conversationText;
}

async function resolveBusinessData(body: {
  sessionId?: string;
  businessData?: BusinessData;
}): Promise<{ sessionId: string; businessId: string; businessData: BusinessData }> {
  if (body.businessData) {
    const session = await prisma.session.create({ data: { status: "business_extracted" } });
    const business = await prisma.business.create({
      data: {
        sessionId: session.id,
        ...toBusinessRecord(body.businessData)
      }
    });
    return { sessionId: session.id, businessId: business.id, businessData: body.businessData };
  }

  const business = await prisma.business.findUnique({
    where: { sessionId: body.sessionId },
    include: { session: true }
  });

  if (!business) {
    throw new AppError(404, "Business data was not found for this session.");
  }

  return {
    sessionId: business.sessionId,
    businessId: business.id,
    businessData: fromBusinessRecord(business)
  };
}

async function resolveBusinessDataForSeo(body: {
  sessionId?: string;
  websiteId?: string;
  businessData?: BusinessData;
}): Promise<BusinessData> {
  if (body.businessData) return body.businessData;

  if (body.websiteId) {
    const website = await prisma.website.findUnique({
      where: { id: body.websiteId },
      include: { business: true }
    });
    if (!website) throw new AppError(404, "Website was not found.");
    return fromBusinessRecord(website.business);
  }

  const business = await prisma.business.findUnique({ where: { sessionId: body.sessionId } });
  if (!business) throw new AppError(404, "Business data was not found for this session.");
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
    missingFields: data.missingFields,
    confidence: data.confidence
  };
}

function fromBusinessRecord(record: unknown): BusinessData {
  return businessDataSchema.parse(record);
}
