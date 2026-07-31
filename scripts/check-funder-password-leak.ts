import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const u = await prisma.user.findUnique({
    where: { email: "residencespaces@gmail.com" },
    include: { funderProfile: true },
  });
  if (!u) {
    console.log("missing user");
    return;
  }
  const matches = await bcrypt.compare("Amanillah@12", u.passwordHash);
  console.log(
    JSON.stringify(
      {
        email: u.email,
        businessName: u.funderProfile?.businessName,
        passwordMatchesBusinessString: matches,
      },
      null,
      2,
    ),
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
