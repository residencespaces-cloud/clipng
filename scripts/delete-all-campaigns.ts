import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const before = await prisma.campaign.count();
  console.log(`Campaigns before: ${before}`);

  await prisma.$transaction(async (tx) => {
    // Clear optional FK on wallet ledger first
    await tx.walletLedgerEntry.updateMany({
      where: { campaignId: { not: null } },
      data: { campaignId: null },
    });

    // PayoutItem has no onDelete cascade from submission
    const deletedPayouts = await tx.payoutItem.deleteMany({});
    console.log(`Deleted payout items: ${deletedPayouts.count}`);

    // Submissions cascade reviews / verifications / earnings
    const deletedSubs = await tx.clipSubmission.deleteMany({});
    console.log(`Deleted submissions: ${deletedSubs.count}`);

    const deletedParts = await tx.campaignParticipation.deleteMany({});
    console.log(`Deleted participations: ${deletedParts.count}`);

    const deletedCampaigns = await tx.campaign.deleteMany({});
    console.log(`Deleted campaigns: ${deletedCampaigns.count}`);
  });

  const after = await prisma.campaign.count();
  console.log(`Campaigns after: ${after}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
