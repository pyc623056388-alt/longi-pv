import { describe, expect, it } from "vitest";
import {
  createSessionToken,
  isValidAccessCode,
  parseAccessCodes,
  verifySessionToken,
} from "./auth";

const TEST_SECRET = "test-secret-for-auth-unit-tests";
const TEST_CODES = parseAccessCodes(
  "LONGI-AU-NSW-01,LONGI-AU-DEMO-01,LONGI-AU-GEN-01"
);

describe("parseAccessCodes", () => {
  it("parses comma-separated codes as uppercase set", () => {
    expect(parseAccessCodes("abc, def ,GHI")).toEqual(new Set(["ABC", "DEF", "GHI"]));
  });

  it("returns empty set for missing input", () => {
    expect(parseAccessCodes(undefined)).toEqual(new Set());
    expect(parseAccessCodes("  ")).toEqual(new Set());
  });
});

describe("isValidAccessCode", () => {
  it("accepts valid codes case-insensitively", () => {
    expect(isValidAccessCode("longi-au-nsw-01", TEST_CODES)).toBe(true);
    expect(isValidAccessCode("  LONGI-AU-DEMO-01  ", TEST_CODES)).toBe(true);
  });

  it("rejects invalid or empty codes", () => {
    expect(isValidAccessCode("WRONG-CODE", TEST_CODES)).toBe(false);
    expect(isValidAccessCode("", TEST_CODES)).toBe(false);
    expect(isValidAccessCode("LONGI-AU-NSW-01", new Set())).toBe(false);
  });
});

describe("session token", () => {
  it("creates a verifiable token", async () => {
    const token = await createSessionToken(TEST_SECRET);
    expect(token.includes(".")).toBe(true);
    await expect(verifySessionToken(token, TEST_SECRET)).resolves.toBe(true);
  });

  it("rejects tampered tokens", async () => {
    const token = await createSessionToken(TEST_SECRET);
    const tampered = token.slice(0, -4) + "xxxx";
    await expect(verifySessionToken(tampered, TEST_SECRET)).resolves.toBe(false);
  });

  it("rejects tokens signed with a different secret", async () => {
    const token = await createSessionToken(TEST_SECRET);
    await expect(verifySessionToken(token, "other-secret")).resolves.toBe(false);
  });
});
