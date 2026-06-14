import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { assertResourceAccess } from "../middleware/auth.js";

export async function claimDraftForUser(siteId: string, userId: string, claimToken: string | null) {
  const website = await prisma.website.findUnique({
    where: { id: siteId },
    include: { session: true }
  });

  if (!website) throw new AppError(404, "Draft was not found.");

  if (website.session.ownerId === userId) {
    return { siteId: website.id, ownerId: userId, claimed: true };
  }

  assertResourceAccess(website.session, { userId, claimToken });

  await prisma.$transaction(async (transaction) => {
    const claimedSession = await transaction.session.updateMany({
      where: {
        id: website.sessionId,
        ownerId: null,
        claimTokenHash: website.session.claimTokenHash
      },
      data: {
        ownerId: userId,
        claimTokenHash: null,
        claimTokenExpiresAt: null
      }
    });

    if (claimedSession.count !== 1) {
      throw new AppError(409, "Draft has already been claimed.");
    }

    await transaction.business.updateMany({
      where: { sessionId: website.sessionId },
      data: { ownerId: userId }
    });
    await transaction.website.updateMany({
      where: { sessionId: website.sessionId },
      data: { ownerId: userId }
    });
  });

  return { siteId: website.id, ownerId: userId, claimed: true };
}
