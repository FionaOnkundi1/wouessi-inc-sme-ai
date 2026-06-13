import { describe, expect, it } from "vitest";
import { buildSectionFallback } from "../src/services/ai/sectionRegeneration.js";

describe("section regeneration fallback", () => {
  it("uses the provided hero answer without exposing its field label", () => {
    const patch = buildSectionFallback(
      "hero",
      "[tagline] Reliable electrical help across Melbourne",
      {
        tagline: "Old tagline",
        desc: "Licensed local electricians."
      }
    );

    expect(patch.tagline).toBe("Reliable electrical help across Melbourne");
    expect(patch.desc).toBe("Licensed local electricians.");
  });

  it("preserves the existing location for a contact fallback", () => {
    const patch = buildSectionFallback(
      "contact",
      "[phone] 0412 345 678",
      { location: "Melbourne" }
    );

    expect(patch.location).toBe("Melbourne");
  });
});
