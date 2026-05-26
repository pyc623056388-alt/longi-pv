import { describe, expect, it } from "vitest";
import {
  COMPETITOR_LIBRARY_DEFAULTS,
  LONGI_LIBRARY_DEFAULTS,
  enrichModuleRecord,
  libraryDefaultSpecStrings,
} from "./module-library-defaults";
import type { ModuleRecord } from "./pv-types";

const bareLongi: ModuleRecord = {
  id: "test-l",
  manufacturer: "LONGi",
  model: "LR7-54HVH-475M",
  powerWp: 475,
  library: "longi",
  source: "pan",
};

describe("enrichModuleRecord", () => {
  it("fills missing BC commercial fields without overwriting PAN temp coef", () => {
    const withPan = { ...bareLongi, pmpTempCoef: -0.257 };
    const enriched = enrichModuleRecord(withPan);
    expect(enriched.pricePerW).toBe(LONGI_LIBRARY_DEFAULTS.pricePerW);
    expect(enriched.firstYearDegradationPct).toBe(0.8);
    expect(enriched.annualDegradationPct).toBe(0.35);
    expect(enriched.pmpTempCoef).toBe(-0.257);
  });

  it("does not overwrite user-set price", () => {
    const enriched = enrichModuleRecord({
      ...bareLongi,
      pricePerW: 0.31,
    });
    expect(enriched.pricePerW).toBe(0.31);
  });

  it("applies TOPCon competitor defaults", () => {
    const enriched = enrichModuleRecord({
      id: "test-c",
      manufacturer: "Topcon",
      model: "475W",
      powerWp: 475,
      library: "competitor",
      source: "manual",
    });
    expect(enriched.pricePerW).toBe(COMPETITOR_LIBRARY_DEFAULTS.pricePerW);
    expect(enriched.firstYearDegradationPct).toBe(1);
    expect(enriched.annualDegradationPct).toBe(0.4);
    expect(enriched.pmpTempCoef).toBe(-0.29);
  });
});

describe("libraryDefaultSpecStrings", () => {
  it("returns AUD preset strings for each library", () => {
    expect(libraryDefaultSpecStrings("longi").price).toBe("0.25");
    expect(libraryDefaultSpecStrings("competitor").price).toBe("0.23");
  });
});
