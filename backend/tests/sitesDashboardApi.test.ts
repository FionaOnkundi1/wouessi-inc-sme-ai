import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  deleteMany: vi.fn()
}));

vi.mock("../src/lib/prisma.js", () => ({
  prisma: {
    website: {
      findMany: mocks.findMany,
      deleteMany: mocks.deleteMany
    }
  }
}));

vi.mock("../src/middleware/auth.js", () => ({
  applyAuthMiddleware: vi.fn(),
  assertResourceAccess: vi.fn(),
  createOwnership: vi.fn(),
  getRequestPrincipal: vi.fn(() => ({ userId: "user_owner", claimToken: null })),
  requireSignedIn: vi.fn(() => "user_owner")
}));

describe("sites dashboard API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findMany.mockResolvedValue([
      {
        id: "site-one",
        slug: "bright-spark-electrical",
        status: "preview",
        templateId: "trade",
        siteContent: {
          name: "Bright Spark Electrical",
          tagline: "Safe, reliable electrical work"
        },
        business: {
          businessName: "Fallback Business",
          tagline: "Fallback tagline"
        },
        createdAt: new Date("2026-06-13T00:00:00.000Z"),
        updatedAt: new Date("2026-06-14T00:00:00.000Z"),
        publishedAt: null
      }
    ]);
    mocks.deleteMany.mockResolvedValue({ count: 1 });
  });

  it("lists only the signed-in owner's sites in most-recent order", async () => {
    const response = await request(createApp()).get("/api/sites");

    expect(response.status).toBe(200);
    expect(mocks.findMany).toHaveBeenCalledWith({
      where: { ownerId: "user_owner" },
      orderBy: { updatedAt: "desc" },
      include: { business: true }
    });
    expect(response.body.sites).toEqual([
      expect.objectContaining({
        siteId: "site-one",
        name: "Bright Spark Electrical",
        tagline: "Safe, reliable electrical work",
        status: "preview",
        templateId: "trade"
      })
    ]);
  });

  it("uses business details when saved site content has no display name", async () => {
    mocks.findMany.mockResolvedValue([
      {
        id: "site-two",
        slug: "fallback-business",
        status: "preview",
        templateId: "professional",
        siteContent: {},
        business: {
          businessName: "Fallback Business",
          tagline: "Fallback tagline"
        },
        createdAt: new Date("2026-06-13T00:00:00.000Z"),
        updatedAt: new Date("2026-06-14T00:00:00.000Z"),
        publishedAt: null
      }
    ]);

    const response = await request(createApp()).get("/api/sites");

    expect(response.body.sites[0]).toEqual(expect.objectContaining({
      name: "Fallback Business",
      tagline: "Fallback tagline"
    }));
  });

  it("deletes a site only when it belongs to the signed-in owner", async () => {
    const response = await request(createApp()).delete("/api/sites/site-one");

    expect(response.status).toBe(204);
    expect(mocks.deleteMany).toHaveBeenCalledWith({
      where: {
        id: "site-one",
        ownerId: "user_owner"
      }
    });
  });

  it("hides a site that the signed-in owner cannot delete", async () => {
    mocks.deleteMany.mockResolvedValue({ count: 0 });

    const response = await request(createApp()).delete("/api/sites/site-other");

    expect(response.status).toBe(404);
  });
});
