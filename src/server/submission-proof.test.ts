import { describe, expect, it } from "vitest";
import { validatePublicPostUrl } from "@/server/submission-proof";

describe("submission-proof", () => {
  it("accepts valid TikTok URLs", () => {
    expect(validatePublicPostUrl("https://www.tiktok.com/@user/video/123", "TikTok")).toBeNull();
  });

  it("rejects profile URLs", () => {
    expect(validatePublicPostUrl("https://www.tiktok.com/@user", "TikTok")).not.toBeNull();
  });
});
