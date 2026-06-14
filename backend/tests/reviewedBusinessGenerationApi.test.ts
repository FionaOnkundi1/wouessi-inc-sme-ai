import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import { createClaimToken } from "../src/services/claimToken.js";

const sessionId = "a2bde8ee-3777-4919-a861-47af4e812593";

const reviewedBusinessData = {
  businessName: "BrightSpark Electrical",
  businessType: "Electrical Services",
  productsOrServices: "Emergency call-outs, switchboard upgrades, lighting installation",
  location: "Melbourne",
  targetCustomers: "Homeowners and small businesses",
  uniqueSellingPoint: "Licensed electricians with same-day emergency service",
  websiteVibe: "bold",
  extraFeatures: "",
  tagline: "Reliable electrical help, day or night",
  shortDescription: "Licensed local electricians serving Melbourne.",
  contactHint: "hello@brightspark.test, 0400 000 000",
  competitorReference: "",
  missingFields: [],
  confidence: "high"
};

const mocks = vi.hoisted(() => ({
  sessionFindUnique: vi.fn(),
  sessionUpdate: vi.fn(),
  businessUpsert: vi.fn(),
  websiteCreate: vi.fn()
}));

vi.mock("../src/lib/prisma.js", () => ({
  prisma: {
    session: {
      findUnique: mocks.sessionFindUnique,
      update: mocks.sessionUpdate
    },
    business: {
      upsert: mocks.businessUpsert
    },
    website: {
      create: mocks.websiteCreate
    }
  }
}));

describe("reviewed business generation API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.sessionUpdate.mockResolvedValue({ id: sessionId });
    mocks.businessUpsert.mockResolvedValue({
      id: "business-one",
      sessionId
    });
    mocks.websiteCreate.mockImplementation(async ({ data }) => ({
      id: "site-one",
      ...data
    }));
  });

  it("updates an accessible session with reviewed details before generation", async () => {
    const claim = createClaimToken();
    mocks.sessionFindUnique.mockResolvedValue({
      id: sessionId,
      ownerId: null,
      claimTokenHash: claim.hash,
      claimTokenExpiresAt: claim.expiresAt
    });

    const response = await request(createApp())
      .post("/api/generate-site")
      .set("X-Wouessi-Claim-Token", claim.token)
      .send({
        sessionId,
        businessData: reviewedBusinessData
      });

    expect(response.status).toBe(201);
    expect(response.body.businessData.businessName).toBe("BrightSpark Electrical");
    expect(response.body.claimToken).toBe(claim.token);
    expect(mocks.businessUpsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { sessionId },
      update: expect.objectContaining({
        businessName: "BrightSpark Electrical",
        targetCustomers: "Homeowners and small businesses"
      })
    }));
    expect(mocks.websiteCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        sessionId,
        businessId: "business-one",
        ownerId: null
      })
    }));
  });

  it("hides a reviewed anonymous session when its claim token is missing", async () => {
    const claim = createClaimToken();
    mocks.sessionFindUnique.mockResolvedValue({
      id: sessionId,
      ownerId: null,
      claimTokenHash: claim.hash,
      claimTokenExpiresAt: claim.expiresAt
    });

    const response = await request(createApp())
      .post("/api/generate-site")
      .send({
        sessionId,
        businessData: reviewedBusinessData
      });

    expect(response.status).toBe(404);
    expect(mocks.businessUpsert).not.toHaveBeenCalled();
    expect(mocks.websiteCreate).not.toHaveBeenCalled();
  });
});
