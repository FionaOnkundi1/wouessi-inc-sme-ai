import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import { createClaimToken } from "../src/services/claimToken.js";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  regenerateSection: vi.fn()
}));

vi.mock("../src/lib/prisma.js", () => ({
  prisma: {
    website: {
      findUnique: mocks.findUnique
    }
  }
}));

vi.mock("../src/services/ai/sectionRegeneration.js", () => ({
  regenerateSection: mocks.regenerateSection
}));

describe("section regeneration API", () => {
  beforeEach(() => {
    mocks.findUnique.mockReset();
    mocks.regenerateSection.mockReset();
    mocks.regenerateSection.mockResolvedValue({
      data: { tagline: "Reliable electrical help" },
      source: "fallback"
    });
  });

  it("routes section regeneration through Express", async () => {
    const claim = createClaimToken();
    mocks.findUnique.mockResolvedValue({
      id: "a2bde8ee-3777-4919-a861-47af4e812593",
      session: {
        ownerId: null,
        claimTokenHash: claim.hash,
        claimTokenExpiresAt: claim.expiresAt
      }
    });

    const response = await request(createApp())
      .post("/api/regenerate-section")
      .set("X-Wouessi-Claim-Token", claim.token)
      .send({
        siteId: "a2bde8ee-3777-4919-a861-47af4e812593",
        sectionId: "hero",
        answers: "[tagline] Reliable electrical help",
        siteData: {
          tagline: "Old tagline",
          desc: "Licensed local electricians."
        }
      });

    expect(response.status).toBe(200);
    expect(response.body.patch.tagline).toBe("Reliable electrical help");
    expect(response.body.ai.source).toBe("fallback");
  });

  it("hides an anonymous draft when its claim token is missing", async () => {
    const claim = createClaimToken();
    mocks.findUnique.mockResolvedValue({
      id: "a2bde8ee-3777-4919-a861-47af4e812593",
      session: {
        ownerId: null,
        claimTokenHash: claim.hash,
        claimTokenExpiresAt: claim.expiresAt
      }
    });

    const response = await request(createApp())
      .post("/api/regenerate-section")
      .send({
        siteId: "a2bde8ee-3777-4919-a861-47af4e812593",
        sectionId: "hero",
        answers: "[tagline] Reliable electrical help",
        siteData: { tagline: "Old tagline" }
      });

    expect(response.status).toBe(404);
  });
});
