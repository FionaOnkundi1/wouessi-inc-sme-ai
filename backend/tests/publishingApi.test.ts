import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";

const mocks = vi.hoisted(() => ({
  principal: {
    userId: "user_owner" as string | null,
    claimToken: null as string | null
  },
  websiteFindFirst: vi.fn(),
  websiteUpdate: vi.fn(),
  sessionUpdate: vi.fn()
}));

vi.mock("../src/lib/prisma.js", () => ({
  prisma: {
    website: {
      findFirst: mocks.websiteFindFirst,
      update: mocks.websiteUpdate
    },
    session: {
      update: mocks.sessionUpdate
    }
  }
}));

vi.mock("../src/middleware/auth.js", async () => {
  const { AppError } = await import("../src/lib/errors.js");
  return {
    applyAuthMiddleware: vi.fn(),
    assertResourceAccess: vi.fn(),
    createOwnership: vi.fn(),
    getRequestPrincipal: vi.fn(() => mocks.principal),
    requireSignedIn: vi.fn((principal: { userId: string | null }) => {
      if (!principal.userId) throw new AppError(401, "Sign in is required.");
      return principal.userId;
    })
  };
});

const draftWebsite = {
  id: "site-one",
  sessionId: "session-one",
  businessId: "business-one",
  ownerId: "user_owner",
  slug: "bright-spark-electrical",
  status: "preview",
  templateId: "trade",
  styleTokens: { selectedTemplate: "trade", palette: "dark" },
  siteContent: { name: "Bright Spark Electrical", tagline: "Current draft tagline" },
  seo: { title: "Bright Spark Electrical", description: "Current draft SEO" },
  publishedTemplateId: null,
  publishedStyleTokens: null,
  publishedSiteContent: null,
  publishedSeo: null,
  publishedAt: null
};

describe("publishing API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.principal.userId = "user_owner";
    mocks.principal.claimToken = null;
    mocks.websiteFindFirst.mockResolvedValue(draftWebsite);
    mocks.websiteUpdate.mockImplementation(async ({ data }) => ({
      ...draftWebsite,
      ...data
    }));
    mocks.sessionUpdate.mockResolvedValue({ id: "session-one" });
  });

  it("publishes a stable snapshot for the signed-in owner", async () => {
    const response = await request(createApp()).post("/api/sites/site-one/publish");

    expect(response.status).toBe(200);
    expect(mocks.websiteFindFirst).toHaveBeenCalledWith({
      where: { id: "site-one", ownerId: "user_owner" }
    });
    expect(mocks.websiteUpdate).toHaveBeenCalledWith({
      where: { id: "site-one" },
      data: {
        status: "published",
        publishedTemplateId: "trade",
        publishedStyleTokens: draftWebsite.styleTokens,
        publishedSiteContent: draftWebsite.siteContent,
        publishedSeo: draftWebsite.seo,
        publishedAt: expect.any(Date)
      }
    });
    expect(response.body).toEqual(expect.objectContaining({
      siteId: "site-one",
      slug: "bright-spark-electrical",
      status: "published",
      publishUrl: "http://localhost:3000/sites/bright-spark-electrical"
    }));
  });

  it("requires sign-in before publishing", async () => {
    mocks.principal.userId = null;
    mocks.principal.claimToken = "anonymous-claim-token";

    const response = await request(createApp()).post("/api/sites/site-one/publish");

    expect(response.status).toBe(401);
    expect(mocks.websiteFindFirst).not.toHaveBeenCalled();
    expect(mocks.websiteUpdate).not.toHaveBeenCalled();
  });

  it("keeps the legacy publish endpoint owner-only", async () => {
    mocks.principal.userId = null;
    mocks.principal.claimToken = "anonymous-claim-token";

    const response = await request(createApp())
      .post("/api/publish-site")
      .send({ siteId: "site-one" });

    expect(response.status).toBe(401);
    expect(mocks.websiteFindFirst).not.toHaveBeenCalled();
    expect(mocks.websiteUpdate).not.toHaveBeenCalled();
  });

  it("hides another owner's draft during publishing", async () => {
    mocks.principal.userId = "user_other";
    mocks.websiteFindFirst.mockResolvedValue(null);

    const response = await request(createApp()).post("/api/sites/site-one/publish");

    expect(response.status).toBe(404);
    expect(mocks.websiteFindFirst).toHaveBeenCalledWith({
      where: { id: "site-one", ownerId: "user_other" }
    });
    expect(mocks.websiteUpdate).not.toHaveBeenCalled();
  });

  it("unpublishes an owner's website without changing its retained snapshot", async () => {
    mocks.websiteFindFirst.mockResolvedValue({
      ...draftWebsite,
      status: "published",
      publishedTemplateId: "trade",
      publishedStyleTokens: { selectedTemplate: "trade", palette: "published-dark" },
      publishedSiteContent: { name: "Published Bright Spark" },
      publishedSeo: { title: "Published Bright Spark" },
      publishedAt: new Date("2026-06-14T00:00:00.000Z")
    });

    const response = await request(createApp()).post("/api/sites/site-one/unpublish");

    expect(response.status).toBe(200);
    expect(mocks.websiteUpdate).toHaveBeenCalledWith({
      where: { id: "site-one" },
      data: {
        status: "preview",
        publishedAt: null
      }
    });
    expect(response.body).toEqual(expect.objectContaining({
      status: "preview",
      publishUrl: null,
      publishedAt: null
    }));
  });

  it("returns only the published snapshot from the public endpoint", async () => {
    mocks.websiteFindFirst.mockResolvedValue({
      ...draftWebsite,
      status: "published",
      siteContent: { name: "Private draft name" },
      seo: { title: "Private draft SEO" },
      publishedTemplateId: "trade",
      publishedStyleTokens: { selectedTemplate: "trade", palette: "published-dark" },
      publishedSiteContent: { name: "Published Bright Spark", tagline: "Published tagline" },
      publishedSeo: { title: "Published Bright Spark", description: "Published SEO" },
      publishedAt: new Date("2026-06-14T00:00:00.000Z")
    });

    const response = await request(createApp()).get("/api/public/sites/bright-spark-electrical");

    expect(response.status).toBe(200);
    expect(mocks.websiteFindFirst).toHaveBeenCalledWith({
      where: {
        slug: "bright-spark-electrical",
        status: "published"
      }
    });
    expect(response.body.siteContent).toEqual({
      name: "Published Bright Spark",
      tagline: "Published tagline",
      slug: "bright-spark-electrical"
    });
    expect(response.body.seo.title).toBe("Published Bright Spark");
    expect(response.body).not.toHaveProperty("ownerId");
    expect(response.body).not.toHaveProperty("business");
    expect(response.body).not.toHaveProperty("session");
  });

  it("hides unpublished sites and legacy published records without snapshots", async () => {
    mocks.websiteFindFirst.mockResolvedValue(null);

    const unpublishedResponse = await request(createApp())
      .get("/api/public/sites/bright-spark-electrical");

    expect(unpublishedResponse.status).toBe(404);

    mocks.websiteFindFirst.mockResolvedValue({
      ...draftWebsite,
      status: "published"
    });

    const legacyResponse = await request(createApp())
      .get("/api/public/sites/bright-spark-electrical");

    expect(legacyResponse.status).toBe(404);
  });
});
