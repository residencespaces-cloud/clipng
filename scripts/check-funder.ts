import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "residencespaces@gmail.com" },
    include: { funderProfile: { include: { wallet: true } } },
  });
  console.log(
    JSON.stringify(
      {
        found: Boolean(user),
        email: user?.email,
        role: user?.role,
        funderProfileId: user?.funderProfile?.id,
        business: user?.funderProfile?.businessName,
        balanceNaira: user?.funderProfile?.wallet
          ? Number(user.funderProfile.wallet.balanceKobo) / 100
          : null,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
