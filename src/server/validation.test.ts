import { describe, expect, it } from "vitest";
import { isValidEmail, isValidPassword } from "@/server/validation";

describe("validation", () => {
  it("validates email", () => {
    expect(isValidEmail("test@kudiclip.ng")).toBe(true);
    expect(isValidEmail("bad")).toBe(false);
  });

  it("validates password length", () => {
    expect(isValidPassword("password123")).toBe(true);
    expect(isValidPassword("short")).toBe(false);
  });
});
