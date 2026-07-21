import { describe, expect, it } from "vitest";
import { clipperEarningsKobo, koboToNaira } from "@/server/money";

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
