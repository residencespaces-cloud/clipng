/**
 * Preview / smoke-send every transactional email template.
 * Usage: npx tsx scripts/preview-emails.ts [email]
 */
import "dotenv/config";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import * as T from "../src/server/emails/templates";
import { sendEmail } from "../src/server/email";

async function main() {
  const to = process.argv[2] ?? "rabiutemi@gmail.com";
  const samples: ReturnType<typeof T.welcomeClipper>[] = [
    T.welcomeClipper("Adaeze"),
    T.welcomeFunder("Spaceship Collective", true),
    T.clipSubmitted("Burna Boy Drop"),
    T.clipApproved("Burna Boy Drop"),
    T.clipRejected("Burna Boy Drop", "Code not visible in caption"),
    T.viewsCredited({
      campaignName: "Burna Boy Drop",
      creditedViews: 15000,
      totalViews: 25000,
      earningsNaira: 7200,
      isFirst: false,
    }),
    T.payoutTriggered("Burna Boy Drop", 4800),
    T.payoutCompleted("Burna Boy Drop", 4800),
    T.payoutFailed("Bank rejected transfer"),
    T.walletToppedUp(50000),
    T.campaignLaunched("Burna Boy Drop", 300000),
    T.campaignBudgetExtended("Burna Boy Drop", 100000),
    T.verifyEmail("Adaeze", "https://kudiclip.com/verify-email?token=demo"),
    T.loginAlert(to, new Date().toISOString()),
    T.passwordReset("https://kudiclip.com/reset-password?token=demo"),
    T.campaignBudgetLow("Burna Boy Drop", 45000, 15),
    T.campaignExhausted("Burna Boy Drop"),
    T.campaignEndingSoon("Burna Boy Drop", "2026-08-01", "funder"),
    T.newLiveCampaign("Burna Boy Drop", 600),
    T.adminClipPending("Adaeze Obi", "Burna Boy Drop"),
    T.weeklyEarningsSummary({
      totalEarnedNaira: 18400,
      pendingNaira: 4800,
      paidNaira: 13600,
      clipsVerified: 3,
    }),
  ];

  const outDir = join(process.cwd(), "tmp", "email-previews");
  mkdirSync(outDir, { recursive: true });
  samples.forEach((s, i) => {
    const file = join(outDir, `${String(i + 1).padStart(2, "0")}.html`);
    writeFileSync(file, s.html);
  });
  console.log(`Wrote ${samples.length} previews to ${outDir}`);

  // Send one representative sample (login alert) to confirm Resend delivery
  const sample = T.loginAlert(to, new Date().toISOString());
  const result = await sendEmail({ to, subject: `[Preview] ${sample.subject}`, html: sample.html });
  console.log("Sample sent:", result);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
