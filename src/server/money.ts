export const koboToNaira = (kobo: bigint | number) => Number(kobo) / 100;
export const nairaToKobo = (naira: number) => Math.round(naira * 100);

export function clipperEarningsKobo(views: number, cpmKobo: number, platformFeePercent = 20) {
  const gross = Math.round((views / 1000) * cpmKobo);
  const clipper = Math.round(gross * (1 - platformFeePercent / 100));
  return { gross, clipper, platform: gross - clipper };
}

export function generateVerificationCode(campaignId: string, clipperId: string) {
  const cShort = campaignId.replace(/-/g, "").slice(0, 4).toUpperCase();
  const uShort = clipperId.replace(/-/g, "").slice(0, 4).toUpperCase();
  return `#CNG-${cShort}-${uShort}`;
}
