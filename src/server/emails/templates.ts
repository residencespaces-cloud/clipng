import { appUrl, fmtNaira, renderEmail, type EmailContent } from "./layout";

function mail(
  subject: string,
  body: string,
  opts: Parameters<typeof renderEmail>[0],
): EmailContent {
  return { subject, body, html: renderEmail(opts) };
}

/** 1 — Welcome clipper */
export function welcomeClipper(name: string): EmailContent {
  return mail(
    "Welcome to KudiClip",
    `Hi ${name}, your clipper account is ready. Browse live campaigns and start earning.`,
    {
      title: "Welcome aboard",
      intro: `Hi ${name}, your clipper account is ready. Browse live campaigns, submit clips, and get paid in Naira.`,
      ctaLabel: "Browse campaigns",
      ctaHref: appUrl("/clipper"),
    },
  );
}

/** 2 — Welcome funder */
export function welcomeFunder(business: string, withCredit: boolean): EmailContent {
  const body = withCredit
    ? `Hi ${business}, your funder account is ready and your signup credit has been added to your wallet.`
    : `Hi ${business}, your funder account is ready. Fund your wallet and launch your first campaign.`;
  return mail("Welcome to KudiClip", body, {
    title: "You're set to launch",
    intro: body,
    ctaLabel: "Open funder dashboard",
    ctaHref: appUrl("/funder"),
  });
}

/** 3 — Clip submitted */
export function clipSubmitted(campaignName: string): EmailContent {
  const body = `Your clip for "${campaignName}" is pending admin review.`;
  return mail("Clip submitted", body, {
    title: "Clip received",
    intro: body,
    meta: [{ label: "Campaign", value: campaignName }],
    ctaLabel: "View my clips",
    ctaHref: appUrl("/clipper"),
  });
}

/** 4 — Clip approved */
export function clipApproved(campaignName: string): EmailContent {
  const body = `Your clip for "${campaignName}" was approved. Earnings will be calculated after view verification.`;
  return mail("Clip approved", body, {
    title: "Clip approved",
    intro: body,
    meta: [{ label: "Campaign", value: campaignName }],
    ctaLabel: "Open dashboard",
    ctaHref: appUrl("/clipper"),
  });
}

/** 5 — Clip rejected */
export function clipRejected(campaignName: string, reason?: string): EmailContent {
  const body = reason
    ? `Your clip for "${campaignName}" was rejected: ${reason}`
    : `Your clip for "${campaignName}" was rejected.`;
  return mail("Clip rejected", body, {
    title: "Clip not approved",
    intro: body,
    meta: [
      { label: "Campaign", value: campaignName },
      ...(reason ? [{ label: "Reason", value: reason }] : []),
    ],
    ctaLabel: "Submit another clip",
    ctaHref: appUrl("/clipper"),
  });
}

/** 6 — Views verified / new views credited */
export function viewsCredited(opts: {
  campaignName: string;
  creditedViews: number;
  totalViews: number;
  earningsNaira: number;
  isFirst: boolean;
}): EmailContent {
  const subject = opts.isFirst ? "Views verified — earnings calculated" : "New views credited";
  const body = `${opts.creditedViews.toLocaleString()} new views on your clip for "${opts.campaignName}" earned you ${fmtNaira(opts.earningsNaira)}. Total credited views: ${opts.totalViews.toLocaleString()}.`;
  return mail(subject, body, {
    title: opts.isFirst ? "Views verified" : "New views credited",
    intro: body,
    meta: [
      { label: "New views", value: opts.creditedViews.toLocaleString() },
      { label: "Earned", value: fmtNaira(opts.earningsNaira) },
      { label: "Total views", value: opts.totalViews.toLocaleString() },
    ],
    ctaLabel: "View earnings",
    ctaHref: appUrl("/clipper"),
  });
}

/** 7 — Payout triggered */
export function payoutTriggered(campaignName: string, amountNaira: number): EmailContent {
  const body = `Your payout of ${fmtNaira(amountNaira)} for "${campaignName}" has been initiated.`;
  return mail("Payout triggered", body, {
    title: "Payout on the way",
    intro: body,
    meta: [
      { label: "Amount", value: fmtNaira(amountNaira) },
      { label: "Campaign", value: campaignName },
    ],
    ctaLabel: "View earnings",
    ctaHref: appUrl("/clipper"),
  });
}

/** 8 — Payout completed */
export function payoutCompleted(campaignName: string, amountNaira: number): EmailContent {
  const body = `Your payout of ${fmtNaira(amountNaira)} for "${campaignName}" has been paid.`;
  return mail("Payout completed", body, {
    title: "Payout completed",
    intro: body,
    meta: [
      { label: "Amount", value: fmtNaira(amountNaira) },
      { label: "Campaign", value: campaignName },
    ],
    footnote: "Funds should appear in your bank account shortly, depending on your bank.",
  });
}

/** 9 — Payout failed */
export function payoutFailed(reason?: string): EmailContent {
  const body = `Your payout could not be completed. Our team will retry. Reason: ${reason ?? "Unknown"}`;
  return mail("Payout failed", body, {
    title: "Payout failed",
    intro: body,
    footnote: "No action needed right now — we'll retry or reach out if we need updated bank details.",
    ctaLabel: "Check bank settings",
    ctaHref: appUrl("/clipper"),
  });
}

/** 10 — Wallet topped up */
export function walletToppedUp(amountNaira: number): EmailContent {
  const body = `Your wallet was credited with ${fmtNaira(amountNaira)}.`;
  return mail("Wallet topped up", body, {
    title: "Wallet topped up",
    intro: body,
    meta: [{ label: "Credited", value: fmtNaira(amountNaira) }],
    ctaLabel: "Open billing",
    ctaHref: appUrl("/funder"),
  });
}

/** 11 — Campaign launched */
export function campaignLaunched(campaignName: string, budgetNaira: number): EmailContent {
  const body = `Your campaign "${campaignName}" is now live with a budget of ${fmtNaira(budgetNaira)}.`;
  return mail("Campaign launched", body, {
    title: "Campaign is live",
    intro: body,
    meta: [
      { label: "Campaign", value: campaignName },
      { label: "Budget", value: fmtNaira(budgetNaira) },
    ],
    ctaLabel: "View campaign",
    ctaHref: appUrl("/funder"),
  });
}

/** 12 — Campaign budget extended */
export function campaignBudgetExtended(campaignName: string, amountNaira: number): EmailContent {
  const body = `You added ${fmtNaira(amountNaira)} to "${campaignName}". Clippers can earn again.`;
  return mail("Campaign budget extended", body, {
    title: "Budget extended",
    intro: body,
    meta: [
      { label: "Campaign", value: campaignName },
      { label: "Added", value: fmtNaira(amountNaira) },
    ],
    ctaLabel: "View campaigns",
    ctaHref: appUrl("/funder"),
  });
}

/** 13 — Verify email */
export function verifyEmail(name: string, verifyUrl: string): EmailContent {
  const body = `Hi ${name}, confirm your email to finish setting up KudiClip.`;
  return mail("Verify your email", body, {
    title: "Confirm your email",
    intro: body,
    ctaLabel: "Verify email",
    ctaHref: verifyUrl,
    footnote: "This link expires in 24 hours. If you didn't create an account, ignore this email.",
  });
}

/** 14 — Login security alert */
export function loginAlert(email: string, whenIso: string): EmailContent {
  const when = new Date(whenIso).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const body = `A sign-in was recorded for ${email} on ${when}.`;
  return mail("You just logged in to KudiClip", body, {
    title: "New sign-in",
    intro: body,
    meta: [
      { label: "Account", value: email },
      { label: "When", value: when },
    ],
    footnote: "If this wasn't you, change your password and contact support.",
    ctaLabel: "Open account",
    ctaHref: appUrl("/login"),
  });
}

/** 15 — Password reset */
export function passwordReset(resetUrl: string): EmailContent {
  const body = "Use the link below to choose a new password. It expires in one hour.";
  return mail("Reset your KudiClip password", body, {
    title: "Reset your password",
    intro: body,
    ctaLabel: "Choose new password",
    ctaHref: resetUrl,
    footnote: "If you didn't request this, you can ignore this email.",
  });
}

/** 16 — Campaign budget low */
export function campaignBudgetLow(
  campaignName: string,
  remainingNaira: number,
  percentLeft: number,
): EmailContent {
  const body = `"${campaignName}" has about ${percentLeft}% budget left (${fmtNaira(remainingNaira)}). Add more before it runs out.`;
  return mail("Campaign budget running low", body, {
    title: "Budget running low",
    intro: body,
    meta: [
      { label: "Remaining", value: fmtNaira(remainingNaira) },
      { label: "Left", value: `${percentLeft}%` },
    ],
    ctaLabel: "Add budget",
    ctaHref: appUrl("/funder"),
  });
}

/** 17 — Campaign exhausted */
export function campaignExhausted(campaignName: string): EmailContent {
  const body = `"${campaignName}" has used its full budget. Add more to reopen payouts for clippers.`;
  return mail("Campaign budget exhausted", body, {
    title: "Budget exhausted",
    intro: body,
    meta: [{ label: "Campaign", value: campaignName }],
    ctaLabel: "Extend budget",
    ctaHref: appUrl("/funder"),
  });
}

/** 18 — Campaign ending soon */
export function campaignEndingSoon(
  campaignName: string,
  endDate: string,
  role: "funder" | "clipper",
): EmailContent {
  const body =
    role === "funder"
      ? `"${campaignName}" ends on ${endDate}. Review performance or extend the end date if needed.`
      : `"${campaignName}" ends on ${endDate}. Submit any remaining clips before it closes.`;
  return mail("Campaign ending soon", body, {
    title: "Campaign ending soon",
    intro: body,
    meta: [
      { label: "Campaign", value: campaignName },
      { label: "Ends", value: endDate },
    ],
    ctaLabel: role === "funder" ? "Open funder dashboard" : "Open campaigns",
    ctaHref: appUrl(role === "funder" ? "/funder" : "/clipper"),
  });
}

/** 19 — New live campaign (clippers) */
export function newLiveCampaign(campaignName: string, cpmNaira: number): EmailContent {
  const body = `"${campaignName}" just went live at ${fmtNaira(cpmNaira)} CPM. Join and start clipping.`;
  return mail("New campaign live on KudiClip", body, {
    title: "New campaign live",
    intro: body,
    meta: [
      { label: "Campaign", value: campaignName },
      { label: "CPM", value: fmtNaira(cpmNaira) },
    ],
    ctaLabel: "View campaigns",
    ctaHref: appUrl("/clipper"),
  });
}

/** 20 — Admin: new clip pending */
export function adminClipPending(clipperName: string, campaignName: string): EmailContent {
  const body = `${clipperName} submitted a clip for "${campaignName}" — ready for review.`;
  return mail("New clip pending review", body, {
    title: "New clip to review",
    intro: body,
    meta: [
      { label: "Clipper", value: clipperName },
      { label: "Campaign", value: campaignName },
    ],
    ctaLabel: "Open admin",
    ctaHref: appUrl("/admin"),
  });
}

/** 21 — Weekly earnings summary */
export function weeklyEarningsSummary(opts: {
  totalEarnedNaira: number;
  pendingNaira: number;
  paidNaira: number;
  clipsVerified: number;
}): EmailContent {
  const body = `This week: ${fmtNaira(opts.totalEarnedNaira)} earned, ${fmtNaira(opts.pendingNaira)} pending, ${fmtNaira(opts.paidNaira)} paid across ${opts.clipsVerified} verified clips.`;
  return mail("Your weekly KudiClip summary", body, {
    title: "Weekly summary",
    intro: "Here's how your clipping week looked.",
    meta: [
      { label: "Earned", value: fmtNaira(opts.totalEarnedNaira) },
      { label: "Pending", value: fmtNaira(opts.pendingNaira) },
      { label: "Paid", value: fmtNaira(opts.paidNaira) },
    ],
    footnote: `${opts.clipsVerified} clip${opts.clipsVerified === 1 ? "" : "s"} with credited views.`,
    ctaLabel: "View earnings",
    ctaHref: appUrl("/clipper"),
  });
}
