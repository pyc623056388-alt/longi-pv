import { describe, expect, it } from "vitest";
import {
  isPpaOutsideReference,
  suggestAccessoryPerModule,
  staticPaybackYears,
} from "./payback-audit";

describe("suggestAccessoryPerModule", () => {
  it("computes otherCostPerWp * Wp", () => {
    expect(suggestAccessoryPerModule(0.6, 475)).toBe(285);
  });

  it("never returns negative", () => {
    expect(suggestAccessoryPerModule(-0.5, 590)).toBe(0);
  });

  it("returns 0 when powerWp is invalid", () => {
    expect(suggestAccessoryPerModule(0.6, 0)).toBe(0);
  });
});

describe("isPpaOutsideReference", () => {
  it("flags high USD PPA", () => {
    expect(isPpaOutsideReference(0.4, "USD")).toBe(true);
  });

  it("accepts typical CNY PPA", () => {
    expect(isPpaOutsideReference(0.35, "CNY")).toBe(false);
  });
});

describe("staticPaybackYears", () => {
  it("divides cost by first-year revenue", () => {
    expect(staticPaybackYears(460_325, 314_708)).toBeCloseTo(1.46, 1);
  });
});
