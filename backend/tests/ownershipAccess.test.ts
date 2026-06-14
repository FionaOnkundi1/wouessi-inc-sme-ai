import { describe, expect, it } from "vitest";
import { assertResourceAccess } from "../src/middleware/auth.js";
import { createClaimToken } from "../src/services/claimToken.js";

describe("private draft access", () => {
  it("allows the matching owner and hides the draft from other users", () => {
    const resource = {
      ownerId: "user_owner",
      claimTokenHash: null,
      claimTokenExpiresAt: null
    };

    expect(() => assertResourceAccess(resource, {
      userId: "user_owner",
      claimToken: null
    })).not.toThrow();
    expect(() => assertResourceAccess(resource, {
      userId: "user_other",
      claimToken: null
    })).toThrow("Draft was not found.");
  });

  it("allows a valid anonymous claim token and hides legacy unowned records", () => {
    const claim = createClaimToken();

    expect(() => assertResourceAccess({
      ownerId: null,
      claimTokenHash: claim.hash,
      claimTokenExpiresAt: claim.expiresAt
    }, {
      userId: null,
      claimToken: claim.token
    })).not.toThrow();

    expect(() => assertResourceAccess({
      ownerId: null,
      claimTokenHash: null,
      claimTokenExpiresAt: null
    }, {
      userId: null,
      claimToken: null
    })).toThrow("Draft was not found.");
  });
});
