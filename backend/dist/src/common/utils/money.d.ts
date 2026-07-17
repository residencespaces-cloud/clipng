export declare const koboToNaira: (kobo: bigint | number) => number;
export declare const nairaToKobo: (naira: number) => number;
export declare function clipperEarningsKobo(views: number, cpmKobo: number, platformFeePercent?: number): {
    gross: number;
    clipper: number;
    platform: number;
};
export declare function generateVerificationCode(campaignId: string, clipperId: string): string;
