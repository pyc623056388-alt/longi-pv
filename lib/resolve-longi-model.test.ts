import { describe, expect, it } from "vitest";
import {
  modelFamilyFromSku,
  resolveLongiModuleByModelParam,
} from "./resolve-longi-model";
import type { ModuleRecord } from "./pv-types";

function mod(model: string, id = model): ModuleRecord {
  return {
    id,
    manufacturer: "LONGi",
    model,
    powerWp: 475,
    lengthMm: 1800,
    widthMm: 1134,
    voc: 40,
    isc: 15,
    vmp: 33,
    imp: 14,
    pmpTempCoef: -0.26,
    library: "longi",
    source: "manual",
  };
}

describe("modelFamilyFromSku", () => {
  it("strips power suffix", () => {
    expect(modelFamilyFromSku("LR7-54HVB-475M")).toBe("LR7-54HVB");
    expect(modelFamilyFromSku("LR7-54HVD-T-475M")).toBe("LR7-54HVD-T");
  });
});

describe("resolveLongiModuleByModelParam", () => {
  const modules = [
    mod("LR7-72HVHF-650M"),
    mod("LR7-72HVH-650M"),
    mod("LR7-54HVB-475M"),
    mod("LR7-54HVH-475M"),
  ];

  it("matches exact model", () => {
    expect(
      resolveLongiModuleByModelParam(modules, "LR7-54HVB-475M")?.model
    ).toBe("LR7-54HVB-475M");
  });

  it("does not match HVHF when asking for HVH", () => {
    expect(
      resolveLongiModuleByModelParam(modules, "LR7-72HVH-650M")?.model
    ).toBe("LR7-72HVH-650M");
  });

  it("falls back to same family when power differs", () => {
    expect(
      resolveLongiModuleByModelParam(modules, "LR7-54HVH-480M")?.model
    ).toBe("LR7-54HVH-475M");
  });

  it("returns undefined when family missing from library", () => {
    expect(
      resolveLongiModuleByModelParam(modules, "LR8-66HYD-650M")
    ).toBeUndefined();
  });
});
