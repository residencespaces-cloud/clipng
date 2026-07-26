export const koboToNaira = (kobo: bigint | number) => Number(kobo) / 100;
export const nairaToKobo = (naira: number) => Math.round(naira * 100);

export const cumulativeGrossKobo = (views: number, cpmKobo: number) =>
  Math.round((views / 1000) * cpmKobo);

export function clipperEarningsKobo(views: number, cpmKobo: number, platformFeePercent = 20) {
  const gross = cumulativeGrossKobo(views, cpmKobo);
  const clipper = Math.round(gross * (1 - platformFeePercent / 100));
  return { gross, clipper, platform: gross - clipper };
}

export interface ViewUpdateInput {
  previousViews: number;
  observedViews: number;
  accruedGrossKobo: number;
  accruedClipperKobo: number;
  cpmKobo: number;
  remainingKobo: number;
  platformFeePercent?: number;
}

/**
 * Views are cumulative, earnings are incremental: gross is always derived from
 * the cumulative view total, then reduced by what the submission already
 * accrued. This keeps repeated updates free of double-payment and rounding
 * drift. Credited views are capped so a single update can never spend more than
 * the campaign's remaining budget.
 */
export function viewUpdateEarningsKobo(input: ViewUpdateInput) {
  const feePercent = input.platformFeePercent ?? 20;
  const cpmKobo = Math.max(0, input.cpmKobo);
  const previousViews = Math.max(0, Math.floor(input.previousViews));
  const observedViews = Math.max(0, Math.floor(input.observedViews));
  const remainingKobo = Math.max(0, Math.floor(input.remainingKobo));
  const accruedGross = Math.max(0, input.accruedGrossKobo);
  const accruedClipper = Math.max(0, input.accruedClipperKobo);

  let creditedViews = Math.max(0, observedViews - previousViews);
  let deltaGross = cumulativeGrossKobo(previousViews + creditedViews, cpmKobo) - accruedGross;
  let cappedByBudget = false;

  if (deltaGross > remainingKobo) {
    cappedByBudget = true;
    const affordableViews =
      cpmKobo > 0
        ? Math.floor(((accruedGross + remainingKobo) / cpmKobo) * 1000) - previousViews
        : 0;
    creditedViews = Math.max(0, Math.min(creditedViews, affordableViews));
    deltaGross = Math.min(
      cumulativeGrossKobo(previousViews + creditedViews, cpmKobo) - accruedGross,
      remainingKobo,
    );
  }

  deltaGross = Math.max(0, deltaGross);
  const totalClipper = Math.round((accruedGross + deltaGross) * (1 - feePercent / 100));
  const deltaClipperKobo = Math.max(0, Math.min(deltaGross, totalClipper - accruedClipper));

  return {
    creditedViews,
    totalViews: previousViews + creditedViews,
    uncreditedViews: Math.max(0, observedViews - (previousViews + creditedViews)),
    deltaGrossKobo: deltaGross,
    deltaClipperKobo,
    deltaPlatformKobo: deltaGross - deltaClipperKobo,
    cappedByBudget,
  };
}

export function generateVerificationCode(campaignId: string, clipperId: string) {
  const cShort = campaignId.replace(/-/g, "").slice(0, 4).toUpperCase();
  const uShort = clipperId.replace(/-/g, "").slice(0, 4).toUpperCase();
  return `#CNG-${cShort}-${uShort}`;
}
