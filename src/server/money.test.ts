import { describe, expect, it } from "vitest";
import { clipperEarningsKobo, koboToNaira, viewUpdateEarningsKobo } from "@/server/money";

describe("money", () => {
  it("calculates clipper earnings with platform fee", () => {
    const { gross, clipper, platform } = clipperEarningsKobo(10_000, 60_000, 20);
    expect(gross).toBe(600_000);
    expect(clipper).toBe(480_000);
    expect(platform).toBe(120_000);
  });

  it("converts kobo to naira", () => {
    expect(koboToNaira(100_000)).toBe(1000);
  });
});

describe("viewUpdateEarningsKobo", () => {
  const base = {
    cpmKobo: 60_000,
    remainingKobo: 10_000_000,
    platformFeePercent: 20,
  };

  it("credits the full amount on a first update", () => {
    const r = viewUpdateEarningsKobo({
      ...base,
      previousViews: 0,
      observedViews: 10_000,
      accruedGrossKobo: 0,
      accruedClipperKobo: 0,
    });
    expect(r.creditedViews).toBe(10_000);
    expect(r.deltaGrossKobo).toBe(600_000);
    expect(r.deltaClipperKobo).toBe(480_000);
    expect(r.cappedByBudget).toBe(false);
  });

  it("only pays the views gained since the last update", () => {
    const r = viewUpdateEarningsKobo({
      ...base,
      previousViews: 10_000,
      observedViews: 25_000,
      accruedGrossKobo: 600_000,
      accruedClipperKobo: 480_000,
    });
    expect(r.creditedViews).toBe(15_000);
    expect(r.totalViews).toBe(25_000);
    expect(r.deltaGrossKobo).toBe(900_000);
    expect(r.deltaClipperKobo).toBe(720_000);
  });

  it("caps credited views at the remaining campaign budget", () => {
    const r = viewUpdateEarningsKobo({
      ...base,
      remainingKobo: 300_000,
      previousViews: 10_000,
      observedViews: 30_000,
      accruedGrossKobo: 600_000,
      accruedClipperKobo: 480_000,
    });
    expect(r.cappedByBudget).toBe(true);
    expect(r.creditedViews).toBe(5_000);
    expect(r.totalViews).toBe(15_000);
    expect(r.uncreditedViews).toBe(15_000);
    expect(r.deltaGrossKobo).toBe(300_000);
  });

  it("credits nothing when the view count has not grown", () => {
    const r = viewUpdateEarningsKobo({
      ...base,
      previousViews: 10_000,
      observedViews: 9_000,
      accruedGrossKobo: 600_000,
      accruedClipperKobo: 480_000,
    });
    expect(r.creditedViews).toBe(0);
    expect(r.deltaGrossKobo).toBe(0);
    expect(r.deltaClipperKobo).toBe(0);
  });

  it("never drifts across many small updates", () => {
    let accruedGross = 0;
    let accruedClipper = 0;
    let views = 0;
    for (let i = 0; i < 10; i++) {
      views += 137;
      const r = viewUpdateEarningsKobo({
        ...base,
        previousViews: views - 137,
        observedViews: views,
        accruedGrossKobo: accruedGross,
        accruedClipperKobo: accruedClipper,
      });
      accruedGross += r.deltaGrossKobo;
      accruedClipper += r.deltaClipperKobo;
    }
    const oneShot = clipperEarningsKobo(views, base.cpmKobo, 20);
    expect(accruedGross).toBe(oneShot.gross);
    expect(accruedClipper).toBe(oneShot.clipper);
  });
});
