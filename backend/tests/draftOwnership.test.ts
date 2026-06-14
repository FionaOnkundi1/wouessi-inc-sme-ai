import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClaimToken } from "../src/services/claimToken.js";
import { claimDraftForUser } from "../src/services/draftOwnership.js";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  transaction: vi.fn(),
  sessionUpdateMany: vi.fn(),
  businessUpdateMany: vi.fn(),
  websiteUpdateMany: vi.fn()
}));

vi.mock("../src/lib/prisma.js", () => ({
  prisma: {
    website: { findUnique: mocks.findUnique },
    $transaction: mocks.transaction
  }
}));

describe("draft claiming", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.sessionUpdateMany.mockResolvedValue({ count: 1 });
    mocks.businessUpdateMany.mockResolvedValue({ count: 1 });
    mocks.websiteUpdateMany.mockResolvedValue({ count: 1 });
    mocks.transaction.mockImplementation(async (callback) => callback({
      session: { updateMany: mocks.sessionUpdateMany },
      business: { updateMany: mocks.businessUpdateMany },
      website: { updateMany: mocks.websiteUpdateMany }
    }));
  });

  it("atomically assigns an anonymous draft to the signed-in user", async () => {
    const claim = createClaimToken();
    mocks.findUnique.mockResolvedValue({
      id: "site-one",
      sessionId: "session-one",
      session: {
        ownerId: null,
        claimTokenHash: claim.hash,
        claimTokenExpiresAt: claim.expiresAt
      }
    });

    const result = await claimDraftForUser("site-one", "user_owner", claim.token);

    expect(result).toEqual({ siteId: "site-one", ownerId: "user_owner", claimed: true });
    expect(mocks.sessionUpdateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        ownerId: "user_owner",
        claimTokenHash: null,
        claimTokenExpiresAt: null
      })
    }));
    expect(mocks.businessUpdateMany).toHaveBeenCalled();
    expect(mocks.websiteUpdateMany).toHaveBeenCalled();
  });

  it("is idempotent for the same owner", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "site-one",
      sessionId: "session-one",
      session: {
        ownerId: "user_owner",
        claimTokenHash: null,
        claimTokenExpiresAt: null
      }
    });

    const result = await claimDraftForUser("site-one", "user_owner", null);

    expect(result.claimed).toBe(true);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("hides another owner's draft", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "site-one",
      sessionId: "session-one",
      session: {
        ownerId: "user_other",
        claimTokenHash: null,
        claimTokenExpiresAt: null
      }
    });

    await expect(claimDraftForUser("site-one", "user_owner", null))
      .rejects.toThrow("Draft was not found.");
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
