import { describe, expect, it } from "vitest";
import {
  isPpaOutsideReference,
  suggestAccessoryPerModule,
  staticPaybackYears,
} from "./payback-audit";

describe("suggestAccessoryPerModule", () => {
  it("computes (epc - modulePrice) * Wp", () => {
    expect(suggestAccessoryPerModule(3.5, 1.0, 590)).toBeCloseTo(1475, 0);
  });

  it("never returns negative", () => {
    expect(suggestAccessoryPerModule(0.5, 1.0, 590)).toBe(0);
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
