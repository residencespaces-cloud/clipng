"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nairaToKobo = exports.koboToNaira = void 0;
exports.clipperEarningsKobo = clipperEarningsKobo;
exports.generateVerificationCode = generateVerificationCode;
const koboToNaira = (kobo) => Number(kobo) / 100;
exports.koboToNaira = koboToNaira;
const nairaToKobo = (naira) => Math.round(naira * 100);
exports.nairaToKobo = nairaToKobo;
function clipperEarningsKobo(views, cpmKobo, platformFeePercent = 20) {
    const gross = Math.round((views / 1000) * cpmKobo);
    const clipper = Math.round(gross * (1 - platformFeePercent / 100));
    return { gross, clipper, platform: gross - clipper };
}
function generateVerificationCode(campaignId, clipperId) {
    const cShort = campaignId.replace(/-/g, '').slice(0, 4).toUpperCase();
    const uShort = clipperId.replace(/-/g, '').slice(0, 4).toUpperCase();
    return `#CNG-${cShort}-${uShort}`;
}
//# sourceMappingURL=money.js.map