import { describe, expect, it } from "vitest";
import {
  prepareModuleForPersist,
  recordWithAllOverrides,
} from "./module-persist";
import type { ModuleRecord } from "./pv-types";

const incompletePan: ModuleRecord = {
  id: "mod_test",
  manufacturer: "LONGi",
  model: "LR7-72HVH-640M",
  powerWp: 640,
  lengthMm: 2382,
  widthMm: 1134,
  library: "longi",
  source: "pan",
};

describe("recordWithAllOverrides", () => {
  it("merges session overrides before single-field save", () => {
    const merged = recordWithAllOverrides(incompletePan, {
      firstYearDeg: "1.2",
      annualDeg: "0.45",
      price: "0.88",
    });
    expect(merged.firstYearDegradationPct).toBe(1.2);
    expect(merged.annualDegradationPct).toBe(0.45);
    expect(merged.pricePerW).toBe(0.88);
  });
});

describe("prepareModuleForPersist", () => {
  it("allows save when only minimal fields pass (missing temp coef)", () => {
    const withDeg = recordWithAllOverrides(incompletePan, {
      firstYearDeg: "1",
      annualDeg: "0.4",
    });
    const result = prepareModuleForPersist(withDeg);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.record.firstYearDegradationPct).toBe(1);
    }
  });

  it("blocks when model or power invalid", () => {
    const result = prepareModuleForPersist({
      ...incompletePan,
      model: "",
      powerWp: 0,
    });
    expect(result.ok).toBe(false);
  });
});
