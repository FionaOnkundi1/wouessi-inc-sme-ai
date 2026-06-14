import { describe, expect, it } from "vitest";
import {
  CLAIM_TOKEN_TTL_MS,
  createClaimToken,
  hashClaimToken,
  isValidClaimToken
} from "../src/services/claimToken.js";

describe("anonymous draft claim tokens", () => {
  it("stores a hash rather than the raw token", () => {
    const claim = createClaimToken(new Date("2026-06-13T00:00:00.000Z"));

    expect(claim.hash).toBe(hashClaimToken(claim.token));
    expect(claim.hash).not.toContain(claim.token);
    expect(claim.expiresAt.getTime()).toBe(
      new Date("2026-06-13T00:00:00.000Z").getTime() + CLAIM_TOKEN_TTL_MS
    );
  });

  it("accepts the matching token before expiry", () => {
    const createdAt = new Date("2026-06-13T00:00:00.000Z");
    const claim = createClaimToken(createdAt);

    expect(isValidClaimToken(
      { claimTokenHash: claim.hash, claimTokenExpiresAt: claim.expiresAt },
      claim.token,
      new Date("2026-06-13T12:00:00.000Z")
    )).toBe(true);
  });

  it("rejects incorrect and expired tokens", () => {
    const createdAt = new Date("2026-06-13T00:00:00.000Z");
    const claim = createClaimToken(createdAt);
    const record = { claimTokenHash: claim.hash, claimTokenExpiresAt: claim.expiresAt };

    expect(isValidClaimToken(record, "incorrect-token", createdAt)).toBe(false);
    expect(isValidClaimToken(record, claim.token, claim.expiresAt)).toBe(false);
  });
});
