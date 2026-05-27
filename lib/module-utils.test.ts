import { describe, expect, it } from "vitest";
import {
  formatPricePerWDisplay,
  formatPricePerWParts,
  longiSpecAdvantageVariant,
  metricHigherIsBetter,
  moduleRecordToSpec,
  moduleSpecForCalculation,
  specFieldHigherIsBetter,
} from "./module-utils";
import type { ModuleRecord } from "./pv-types";

describe("specFieldHigherIsBetter", () => {
  it("marks dimensions as non-comparable", () => {
    expect(specFieldHigherIsBetter("dimensions")).toBeNull();
  });
});

describe("metricHigherIsBetter", () => {
  it("treats module count as lower-is-better", () => {
    expect(metricHigherIsBetter("组件块数")).toBe(false);
  });
});

describe("formatPricePerWParts", () => {
  it("returns unset when price is empty", () => {
    expect(formatPricePerWParts("", 645, "A$")).toEqual({ unset: true });
  });

  it("includes per-panel line when power is known (zh unit)", () => {
    expect(formatPricePerWParts("0.1924", 475, "A$")).toEqual({
      perW: "A$0.1924/W",
      perPanel: "≈ A$91.39/块",
    });
  });

  it("uses English per-module unit when provided", () => {
    expect(formatPricePerWParts("0.1924", 475, "A$", "module")).toEqual({
      perW: "A$0.1924/W",
      perPanel: "≈ A$91.39/module",
    });
  });

  it("formatPricePerWDisplay matches joined parts", () => {
    const parts = formatPricePerWParts("0.1924", 475, "A$");
    if (parts.unset) throw new Error("expected parts");
    expect(formatPricePerWDisplay("0.1924", 475, "A$")).toBe(
      `${parts.perW}（${parts.perPanel}）`
    );
  });

  it("formatPricePerWDisplay uses notSet from options", () => {
    expect(
      formatPricePerWDisplay("", 475, "A$", { notSet: "Not set" })
    ).toBe("Not set");
  });
});

describe("moduleRecordToSpec with library defaults", () => {
  it("fills missing price and degradation from LONGi presets", () => {
    const record: ModuleRecord = {
      id: "x",
      manufacturer: "LONGi",
      model: "LR7-54HVH-475M",
      powerWp: 475,
      pmpTempCoef: -0.257,
      library: "longi",
      source: "pan",
    };
    const spec = moduleRecordToSpec(record);
    expect(spec.price).toBe("0.25");
    expect(spec.firstYearDeg).toBe("0.8");
    expect(spec.annualDeg).toBe("0.35");
  });
});

describe("moduleSpecForCalculation", () => {
  it("uses library-specific fallbacks when fields empty", () => {
    const filled = moduleSpecForCalculation(
      { power: "475", tempCoef: "", firstYearDeg: "", annualDeg: "", price: "" },
      "longi"
    );
    expect(filled.price).toBe("0.25");
    expect(filled.firstYearDeg).toBe("0.8");

    const comp = moduleSpecForCalculation(
      { power: "475", tempCoef: "", firstYearDeg: "", annualDeg: "", price: "" },
      "competitor"
    );
    expect(comp.price).toBe("0.23");
    expect(comp.firstYearDeg).toBe("1");
  });
});

describe("longiSpecAdvantageVariant", () => {
  it("favors higher power for LONGi", () => {
    expect(longiSpecAdvantageVariant("power", "645", "580")).toBe("positive");
  });

  it("favors lower degradation for LONGi", () => {
    expect(longiSpecAdvantageVariant("firstYearDeg", "1", "1.5")).toBe(
      "positive"
    );
  });

  it("favors lower price for LONGi", () => {
    expect(longiSpecAdvantageVariant("price", "0.85", "0.9")).toBe("positive");
  });

  it("favors less negative temp coef for LONGi", () => {
    expect(longiSpecAdvantageVariant("tempCoef", "-0.26", "-0.34")).toBe(
      "positive"
    );
  });
});
