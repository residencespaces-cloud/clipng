import "dotenv/config";
import { CampaignStatus, PrismaClient, SourceType } from "@prisma/client";

const prisma = new PrismaClient();
const FUNDER_EMAIL = "residencespaces@gmail.com";

/** Exhausted demo campaigns — no wallet escrow; remaining = 0. */
const CAMPAIGNS = [
  {
    videoId: "KuBzBtQGRPE",
    assetUrl: "https://www.youtube.com/watch?v=KuBzBtQGRPE",
    name: "Iyin Aboyeji — Why I Left Andela & Flutterwave",
    description:
      "Clip the strongest founder lessons from Iyin Aboyeji on leaving Andela and Flutterwave. Pull punchy quotes, timeline beats, and career-takeaway moments for short-form.",
    bestMoments: "Career pivots, Andela/Flutterwave lessons, bold founder quotes",
    platforms: ["TikTok", "Instagram", "YouTube"],
    cpmNaira: 500,
    budgetNaira: 180_000,
    totalViews: 312_400,
    clipCount: 28,
  },
  {
    videoId: "M1pueeOSTrc",
    assetUrl: "https://www.youtube.com/watch?v=M1pueeOSTrc",
    name: "Ayo Akinola — Why Nigerians Don't Buy",
    description:
      "PiggyVest co-founder Ayo Akinola on why Nigerians hesitate to buy even when they need it. Clip consumer psychology, fintech insights, and relatable buying-behaviour moments.",
    bestMoments: "Buying psychology, Nigerian market truths, PiggyVest founder takes",
    platforms: ["TikTok", "Instagram"],
    cpmNaira: 450,
    budgetNaira: 95_000,
    totalViews: 198_200,
    clipCount: 19,
  },
  {
    videoId: "VIDhAYI6nN0",
    assetUrl: "https://www.youtube.com/watch?v=VIDhAYI6nN0",
    name: "Cruise — If Couples Were 100% Honest",
    description:
      "Cruise moral-dilemma skit: if couples were totally honest. Clip the funniest confessions, reaction beats, and relationship hot takes for high-retention shorts.",
    bestMoments: "Honest confessions, awkward couple reactions, punchline cuts",
    platforms: ["TikTok", "Instagram", "YouTube"],
    cpmNaira: 600,
    budgetNaira: 320_000,
    totalViews: 540_100,
    clipCount: 47,
  },
  {
    videoId: "hhT7wx6zWns",
    assetUrl: "https://www.youtube.com/watch?v=hhT7wx6zWns",
    name: "TAAOOMA — Terms and Conditions (Nollywood)",
    description:
      "Promote standout scenes from Terms and Conditions (Sotayo Gaga, Yinka Adebayo, TAAOOMA). Clip comedy peaks, plot twists, and shareable Nollywood moments.",
    bestMoments: "Comedy peaks, star reactions, plot-twist seconds",
    platforms: ["TikTok", "Instagram", "YouTube"],
    cpmNaira: 550,
    budgetNaira: 500_000,
    totalViews: 890_000,
    clipCount: 62,
  },
  {
    videoId: "8lMpj6RXHJo",
    assetUrl: "https://www.youtube.com/watch?v=8lMpj6RXHJo",
    name: "Cruise — Which Lady Has The Best RIZZ?",
    description:
      "Cruise dating challenge with Perliks — who has the best rizz? Clip flirt battles, host reactions, and the most rewatchable lines.",
    bestMoments: "Rizz battles, host reactions, winning lines",
    platforms: ["TikTok", "Instagram"],
    cpmNaira: 650,
    budgetNaira: 240_000,
    totalViews: 410_500,
    clipCount: 35,
  },
  {
    videoId: "Rur9l4MRESA",
    assetUrl: "https://www.youtube.com/watch?v=Rur9l4MRESA",
    name: "Fave × Isbae U — Curiosity Made Me Ask",
    description:
      "Fave on Curiosity Made Me Ask with Isbae U. Clip music, personality, and interview highlights that travel well as short clips.",
    bestMoments: "Fave answers, vibe moments, quotable interview lines",
    platforms: ["TikTok", "Instagram", "YouTube"],
    cpmNaira: 700,
    budgetNaira: 410_000,
    totalViews: 620_800,
    clipCount: 41,
  },
  {
    videoId: "rULPPaAt9uM",
    assetUrl: "https://www.youtube.com/watch?v=rULPPaAt9uM",
    name: "CLIQ — Fulani Princess Blind Dates Yoruba Men",
    description:
      "CLIQ blind-date format: Fulani princess meets Yoruba men (blindfolds). Clip culture-clash humour, date reveals, and viral conversation beats.",
    bestMoments: "Blindfold reveals, culture jokes, date reactions",
    platforms: ["TikTok", "Instagram", "YouTube"],
    cpmNaira: 600,
    budgetNaira: 275_000,
    totalViews: 455_000,
    clipCount: 38,
  },
  {
    videoId: "l_iqXQ6vZM4",
    assetUrl: "https://www.youtube.com/watch?v=l_iqXQ6vZM4",
    name: "Peller & Jarvis — Lovebirds Interview",
    description:
      "Peller & Jarvis break silence on marriage, age gap, and public judgment. Clip emotional answers, defence moments, and headline-worthy quotes.",
    bestMoments: "Marriage talk, age-gap answers, public-judgment responses",
    platforms: ["TikTok", "Instagram", "YouTube"],
    cpmNaira: 750,
    budgetNaira: 360_000,
    totalViews: 505_200,
    clipCount: 44,
  },
  {
    videoId: "byJn1IJHQzU",
    assetUrl: "https://www.youtube.com/watch?v=byJn1IJHQzU",
    name: "Afropolitan — Why Nigerian Businesses Can't Be Sold",
    description:
      "Afropolitan breakdown on why Nigerian businesses are hard to sell. Clip sharp business insights, founder lessons, and debate-ready statements.",
    bestMoments: "Business sale barriers, founder lessons, debate hooks",
    platforms: ["TikTok", "Instagram", "YouTube"],
    cpmNaira: 500,
    budgetNaira: 150_000,
    totalViews: 268_000,
    clipCount: 22,
  },
] as const;

function thumb(videoId: string) {
  // hqdefault is reliably available; maxres often 404s
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function nairaToKobo(naira: number) {
  return Math.round(naira * 100);
}

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: FUNDER_EMAIL },
    include: { funderProfile: true },
  });
  if (!user?.funderProfile) {
    throw new Error(`Funder not found for ${FUNDER_EMAIL}`);
  }

  const funderProfileId = user.funderProfile.id;
  console.log(`Seeding under ${user.funderProfile.businessName} (${FUNDER_EMAIL})`);

  let created = 0;
  for (const c of CAMPAIGNS) {
    const existing = await prisma.campaign.findFirst({
      where: { funderProfileId, assetUrl: c.assetUrl },
    });
    if (existing) {
      console.log(`Skip (exists): ${c.name}`);
      continue;
    }

    const budgetKobo = BigInt(nairaToKobo(c.budgetNaira));
    const row = await prisma.campaign.create({
      data: {
        funderProfileId,
        name: c.name,
        sourceType: SourceType.video,
        assetUrl: c.assetUrl,
        bestMoments: c.bestMoments,
        description: c.description,
        platforms: [...c.platforms],
        cpmKobo: nairaToKobo(c.cpmNaira),
        budgetKobo,
        remainingKobo: BigInt(0),
        totalViews: c.totalViews,
        clipCount: c.clipCount,
        imageUrl: thumb(c.videoId),
        status: CampaignStatus.exhausted,
        startDate: new Date("2026-05-01T00:00:00.000Z"),
        endDate: new Date("2026-07-15T00:00:00.000Z"),
      },
    });
    created++;
    console.log(
      `Created exhausted: ${row.name} | budget ₦${c.budgetNaira.toLocaleString()} | remaining 0`,
    );
  }

  console.log(`Done. Created ${created} / ${CAMPAIGNS.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
