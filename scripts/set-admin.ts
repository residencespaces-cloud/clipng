import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "rabiutemi@gmail.com" },
    update: {
      role: UserRole.admin,
      emailVerified: true,
      status: "active",
      passwordHash,
    },
    create: {
      email: "rabiutemi@gmail.com",
      passwordHash,
      role: UserRole.admin,
      emailVerified: true,
    },
  });

  await prisma.user.updateMany({
    where: { email: "admin@kudiclip.ng", role: UserRole.admin },
    data: { role: UserRole.clipper, status: "suspended" },
  });

  console.log("Admin ready:", admin.email, admin.role, admin.status);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
