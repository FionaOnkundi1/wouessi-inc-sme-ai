import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("section regeneration API", () => {
  it("routes section regeneration through Express", async () => {
    const response = await request(createApp())
      .post("/api/regenerate-section")
      .send({
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
});
