import "dotenv/config";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";
import { sendPasswordResetEmail } from "../src/server/services/notifications.service";

const prisma = new PrismaClient();
const EMAIL = "residencespaces@gmail.com";

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: EMAIL },
    include: { funderProfile: true },
  });
  if (!user?.funderProfile) throw new Error("Funder not found");

  // Invalidate the exposed password and wipe any sessions
  const temporary = randomBytes(24).toString("base64url");
  const passwordHash = await bcrypt.hash(temporary, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    }),
    prisma.funderProfile.update({
      where: { id: user.funderProfile.id },
      data: { businessName: "Residence Spaces" },
    }),
    prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
  ]);

  await sendPasswordResetEmail(user.id, user.email);

  console.log(
    JSON.stringify(
      {
        fixed: true,
        email: EMAIL,
        businessName: "Residence Spaces",
        sessionsCleared: true,
        passwordResetEmailQueued: true,
        note: "Old password invalidated. User must use the reset link (or Forgot password).",
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
