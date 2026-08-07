import { describe, expect, it } from "vitest";
import {
  DEFAULT_MODULE_NEED_PREFERENCES,
  recommendLongiModule,
} from "./module-recommend";
import { inferModuleVariantFeatures, isAntiDustModel } from "./module-variant";
import type { ModuleRecord } from "./pv-types";

function mod(model: string, powerWp: number, id?: string): ModuleRecord {
  return {
    id: id ?? `id_${model.toLowerCase()}`,
    manufacturer: "LONGi Solar",
    model,
    powerWp,
    library: "longi",
    source: "pan",
  };
}

const library650: ModuleRecord[] = [
  mod("LR7-72HVD-650M", 650),
  mod("LR7-72HVDF-650M", 650),
  mod("LR7-72HVH-650M", 650),
  mod("LR7-72HVHF-650M", 650),
  mod("LR8-66HVD-650M", 650),
  mod("LR8-66HVDF-650M", 650),
];

const library540: ModuleRecord[] = [
  mod("LR7-60HVD-540M", 540),
  mod("LR7-60HVH-540M", 540),
  mod("LR7-60HVHL-540M", 540),
];

describe("module-variant", () => {
  it("detects anti-dust F variants", () => {
    expect(isAntiDustModel("LR7-72HVHF-650M")).toBe(true);
    expect(isAntiDustModel("LR7-72HVDF-650M")).toBe(true);
    expect(isAntiDustModel("LR7-72HVH-650M")).toBe(false);
    expect(isAntiDustModel("LR7-72HVD-650M")).toBe(false);
  });

  it("infers features for HVHL / HVH", () => {
    const hl = inferModuleVariantFeatures("LR7-60HVHL-540M");
    expect(hl.lightweight).toBe(true);
    expect(hl.antiDust).toBe(false);
    expect(hl.antiHotspot).toBe(true);

    const hvh = inferModuleVariantFeatures("LR7-72HVH-650M");
    expect(hvh.antiGlare).toBe(true);
    expect(hvh.antiDust).toBe(false);
  });
});

describe("recommendLongiModule", () => {
  it("prefers standard HVH when no special needs", () => {
    const result = recommendLongiModule(library650, {
      powerWp: 650,
      preferences: DEFAULT_MODULE_NEED_PREFERENCES,
    });
    expect(result.module?.model).toBe("LR7-72HVH-650M");
  });

  it("selects anti-dust F variant when antiDust is checked", () => {
    const result = recommendLongiModule(library650, {
      powerWp: 650,
      preferences: { ...DEFAULT_MODULE_NEED_PREFERENCES, antiDust: true },
    });
    expect(result.module?.model).toMatch(/HVHF|HVDF/);
    expect(result.reason).toBe("exact");
    expect(result.matchedNeeds).toContain("antiDust");
  });

  it("selects HVHL when lightweight is checked", () => {
    const result = recommendLongiModule(library540, {
      powerWp: 540,
      preferences: { ...DEFAULT_MODULE_NEED_PREFERENCES, lightweight: true },
    });
    expect(result.module?.model).toBe("LR7-60HVHL-540M");
    expect(result.reason).toBe("exact");
  });

  it("returns none when power band missing", () => {
    const result = recommendLongiModule(library540, {
      powerWp: 650,
      preferences: { antiDust: true },
    });
    expect(result.module).toBeUndefined();
    expect(result.reason).toBe("none");
  });
});
