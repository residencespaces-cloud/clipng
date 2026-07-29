import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();
const ADMIN_EMAIL = "rabiutemi@gmail.com";

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin || admin.role !== UserRole.admin) {
    throw new Error(`Admin ${ADMIN_EMAIL} not found — aborting to avoid wiping everyone`);
  }

  const others = await prisma.user.findMany({
    where: { NOT: { id: admin.id } },
    select: { id: true, email: true, role: true },
  });
  console.log(`Keeping admin: ${admin.email}`);
  console.log(`Deleting ${others.length} users:`, others.map((u) => u.email).join(", ") || "(none)");

  if (others.length === 0) {
    console.log("Nothing to delete.");
    return;
  }

  const ids = others.map((u) => u.id);

  await prisma.$transaction(
    async (tx) => {
      // Campaign graph (in case any remain)
      await tx.walletLedgerEntry.updateMany({
        where: { campaignId: { not: null } },
        data: { campaignId: null },
      });
      await tx.payoutItem.deleteMany({});
      await tx.clipSubmission.deleteMany({});
      await tx.campaignParticipation.deleteMany({});
      await tx.campaign.deleteMany({});

      // Auth / audit / notifications for non-admins
      await tx.refreshToken.deleteMany({ where: { userId: { in: ids } } });
      await tx.notification.deleteMany({ where: { userId: { in: ids } } });
      await tx.auditLog.updateMany({
        where: { actorId: { in: ids } },
        data: { actorId: null },
      });

      // Signup tokens: clear redeem/create refs on doomed users
      await tx.signupToken.updateMany({
        where: { usedByUserId: { in: ids } },
        data: { usedByUserId: null, usedAt: null },
      });
      await tx.signupToken.updateMany({
        where: { createdByAdminId: { in: ids } },
        data: { createdByAdminId: null },
      });

      await tx.submissionReview.deleteMany({ where: { reviewerId: { in: ids } } });
      await tx.viewVerification.deleteMany({ where: { verifierId: { in: ids } } });

      const deleted = await tx.user.deleteMany({ where: { id: { in: ids } } });
      console.log(`Deleted users: ${deleted.count}`);
    },
    { timeout: 60_000 },
  );

  const remaining = await prisma.user.findMany({ select: { email: true, role: true } });
  console.log("Remaining users:", remaining);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
