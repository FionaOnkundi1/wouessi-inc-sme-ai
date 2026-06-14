import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const CLAIM_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export type ClaimTokenRecord = {
  claimTokenHash: string | null;
  claimTokenExpiresAt: Date | null;
};

export function createClaimToken(now = new Date()) {
  const token = randomBytes(32).toString("base64url");

  return {
    token,
    hash: hashClaimToken(token),
    expiresAt: new Date(now.getTime() + CLAIM_TOKEN_TTL_MS)
  };
}

export function hashClaimToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function isValidClaimToken(record: ClaimTokenRecord, token: string | null, now = new Date()) {
  if (!token || !record.claimTokenHash || !record.claimTokenExpiresAt) return false;
  if (record.claimTokenExpiresAt.getTime() <= now.getTime()) return false;

  const providedHash = Buffer.from(hashClaimToken(token), "hex");
  const storedHash = Buffer.from(record.claimTokenHash, "hex");

  return providedHash.length === storedHash.length && timingSafeEqual(providedHash, storedHash);
}
