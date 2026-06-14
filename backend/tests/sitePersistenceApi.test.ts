import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import { createClaimToken } from "../src/services/claimToken.js";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  update: vi.fn()
}));

vi.mock("../src/lib/prisma.js", () => ({
  prisma: {
    website: {
      findUnique: mocks.findUnique,
      update: mocks.update
    }
  }
}));

describe("site persistence API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.update.mockResolvedValue({
      id: "a2bde8ee-3777-4919-a861-47af4e812593",
      status: "preview",
      siteContent: { tagline: "Reliable electrical help" },
      updatedAt: new Date("2026-06-14T00:00:00.000Z")
    });
  });

  it("persists edited content for an accessible anonymous draft", async () => {
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
      .patch("/api/sites/a2bde8ee-3777-4919-a861-47af4e812593")
      .set("X-Wouessi-Claim-Token", claim.token)
      .send({
        siteContent: {
          tagline: "Reliable electrical help",
          siteId: "client-only",
          claimToken: "client-only",
          owned: false
        }
      });

    expect(response.status).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: "a2bde8ee-3777-4919-a861-47af4e812593" },
      data: { siteContent: { tagline: "Reliable electrical help" } }
    });
  });

  it("hides a draft when the claim token is missing", async () => {
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
      .patch("/api/sites/a2bde8ee-3777-4919-a861-47af4e812593")
      .send({ siteContent: { tagline: "Unauthorised edit" } });

    expect(response.status).toBe(404);
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
