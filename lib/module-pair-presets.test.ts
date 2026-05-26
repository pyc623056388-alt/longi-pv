import { describe, expect, it } from "vitest";
import type { ModuleRecord } from "./pv-types";
import {
  isStandardHvhModel,
  resolveLongiHvhModule,
  resolvePresetPairIds,
  matchesQuickPreset,
} from "./module-pair-presets";

const longiFixture: ModuleRecord[] = [
  {
    id: "mod_longi_hvd_475",
    manufacturer: "LONGi",
    model: "LR7-54HVD-475M",
    powerWp: 475,
    library: "longi",
  },
  {
    id: "mod_longi_hvh_475",
    manufacturer: "LONGi",
    model: "LR7-54HVH-475M",
    powerWp: 475,
    library: "longi",
  },
  {
    id: "mod_longi_hvhf_650",
    manufacturer: "LONGi",
    model: "LR7-72HVHF-650M",
    powerWp: 650,
    library: "longi",
  },
  {
    id: "mod_longi_hvh_650",
    manufacturer: "LONGi",
    model: "LR7-72HVH-650M",
    powerWp: 650,
    library: "longi",
  },
];

describe("isStandardHvhModel", () => {
  it("accepts HVH and rejects HVD/HVHF", () => {
    expect(isStandardHvhModel("LR7-54HVH-475M")).toBe(true);
    expect(isStandardHvhModel("LR7-54HVD-475M")).toBe(false);
    expect(isStandardHvhModel("LR7-72HVHF-650M")).toBe(false);
  });
});

describe("resolveLongiHvhModule", () => {
  it("prefers HVH over HVD at same power", () => {
    const picked = resolveLongiHvhModule(longiFixture, 475, 54);
    expect(picked?.id).toBe("mod_longi_hvh_475");
  });

  it("prefers HVH over HVHF at 650W", () => {
    const picked = resolveLongiHvhModule(longiFixture, 650, 72);
    expect(picked?.id).toBe("mod_longi_hvh_650");
  });
});

describe("resolvePresetPairIds", () => {
  it("uses canonical HVH ids when present in library", () => {
    const withCanonical: ModuleRecord[] = [
      ...longiFixture,
      {
        id: "mod_longi_longi_solar_lr7_54hvh_475m",
        manufacturer: "LONGi",
        model: "LR7-54HVH-475M",
        powerWp: 475,
        library: "longi",
      },
    ];
    const { longiId, usedHvhFallback } = resolvePresetPairIds(
      "bc475",
      withCanonical,
      []
    );
    expect(usedHvhFallback).toBe(false);
    expect(longiId).toBe("mod_longi_longi_solar_lr7_54hvh_475m");
  });

  it("falls back to HVH resolver when canonical id missing", () => {
    const { longiId, usedHvhFallback } = resolvePresetPairIds(
      "bc475",
      longiFixture,
      []
    );
    expect(usedHvhFallback).toBe(true);
    expect(longiId).toBe("mod_longi_hvh_475");
  });
});

describe("matchesQuickPreset", () => {
  it("matches resolved HVH fallback pair", () => {
    expect(
      matchesQuickPreset(
        "bc475",
        "mod_longi_hvh_475",
        "mod_competitor_topcon_topcon_475w",
        longiFixture,
        [
          {
            id: "mod_competitor_topcon_topcon_475w",
            manufacturer: "Topcon",
            model: "Topcon 475W",
            powerWp: 475,
            library: "competitor",
            segment: "residential475",
          },
        ]
      )
    ).toBe(true);
  });
});
