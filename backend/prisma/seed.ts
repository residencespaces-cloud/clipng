import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@clipng.ng' },
    update: {},
    create: {
      email: 'admin@clipng.ng',
      passwordHash,
      role: UserRole.admin,
      emailVerified: true,
    },
  });

  const funder = await prisma.user.upsert({
    where: { email: 'funder@clipng.ng' },
    update: {},
    create: {
      email: 'funder@clipng.ng',
      passwordHash,
      role: UserRole.funder,
      emailVerified: true,
      funderProfile: {
        create: {
          businessName: 'Spaceship Collective',
          phone: '+2348000000001',
          wallet: { create: { balanceKobo: BigInt(75_000_000) } },
        },
      },
    },
  });

  const clipper = await prisma.user.upsert({
    where: { email: 'clipper@clipng.ng' },
    update: {},
    create: {
      email: 'clipper@clipng.ng',
      passwordHash,
      role: UserRole.clipper,
      emailVerified: true,
      clipperProfile: {
        create: {
          displayName: 'Adaeze Obi',
          phone: '+2348000000002',
          bankName: 'GTBank',
          accountNumber: '0123456789',
        },
      },
    },
  });

  const funderProfile = await prisma.funderProfile.findUniqueOrThrow({
    where: { userId: funder.id },
  });

  const existingCampaign = await prisma.campaign.findFirst({
    where: { funderProfileId: funderProfile.id },
  });

  if (!existingCampaign) {
    await prisma.campaign.create({
      data: {
        funderProfileId: funderProfile.id,
        name: "Burna Boy — 'City Boys' Drop",
        sourceType: 'video',
        assetUrl: 'https://drive.google.com/',
        description: "Clip the 'City Boys' official video.",
        platforms: ['TikTok', 'Instagram'],
        cpmKobo: 60_000,
        budgetKobo: BigInt(30_000_000),
        remainingKobo: BigInt(18_740_000),
        totalViews: 187667,
        clipCount: 34,
        imageUrl:
          'https://images.unsplash.com/photo-1767661667474-4f2a197c9a51?auto=format&fit=crop&w=1200&q=85',
        status: 'active',
        endDate: new Date('2026-12-31'),
      },
    });
  }

  console.log('Seed complete:', { admin: admin.email, funder: funder.email, clipper: clipper.email });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
