import { clerkMiddleware, getAuth } from "@clerk/express";
import type { Express, Request } from "express";
import { clerkConfigured, env } from "../config/env.js";
import { AppError } from "../lib/errors.js";
import {
  createClaimToken,
  isValidClaimToken,
  type ClaimTokenRecord
} from "../services/claimToken.js";

export type RequestPrincipal = {
  userId: string | null;
  claimToken: string | null;
};

export type OwnedResource = ClaimTokenRecord & {
  ownerId: string | null;
};

export function applyAuthMiddleware(app: Express) {
  if (!clerkConfigured) return;

  app.use(
    clerkMiddleware({
      publishableKey: env.CLERK_PUBLISHABLE_KEY,
      secretKey: env.CLERK_SECRET_KEY,
      authorizedParties: [env.FRONTEND_ORIGIN]
    })
  );
}

export function getRequestPrincipal(req: Request): RequestPrincipal {
  const claimHeader = req.header("X-Wouessi-Claim-Token");
  let userId: string | null = null;

  if (clerkConfigured) {
    userId = getAuth(req).userId ?? null;
  }

  return {
    userId,
    claimToken: claimHeader?.trim() || null
  };
}

export function requireSignedIn(principal: RequestPrincipal) {
  if (!clerkConfigured) {
    throw new AppError(503, "Account saving is unavailable because Clerk is not configured.");
  }
  if (!principal.userId) {
    throw new AppError(401, "Sign in is required.");
  }
  return principal.userId;
}

export function assertResourceAccess(resource: OwnedResource, principal: RequestPrincipal) {
  if (resource.ownerId) {
    if (resource.ownerId === principal.userId) return;
    throw new AppError(404, "Draft was not found.");
  }

  if (isValidClaimToken(resource, principal.claimToken)) return;
  throw new AppError(404, "Draft was not found.");
}

export function createOwnership(principal: RequestPrincipal) {
  if (principal.userId) {
    return {
      ownerId: principal.userId,
      claimToken: null,
      claimTokenHash: null,
      claimTokenExpiresAt: null
    };
  }

  const claim = createClaimToken();
  return {
    ownerId: null,
    claimToken: claim.token,
    claimTokenHash: claim.hash,
    claimTokenExpiresAt: claim.expiresAt
  };
}
