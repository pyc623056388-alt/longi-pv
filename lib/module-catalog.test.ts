import { describe, expect, it } from "vitest";
import topconPresetModules from "./topcon-preset-modules.json";
import {
  applyCompetitorCatalogDefaults,
  filterCatalogVisible,
  isTopconPresetModuleId,
} from "./module-catalog";
import type { ModuleRecord } from "./pv-types";

describe("module-catalog", () => {
  it("marks datasheet competitors hidden and keeps Topcon presets visible", () => {
    const seed: ModuleRecord[] = [
      {
        id: "mod_competitor_jinko_jkm630n",
        manufacturer: "Jinko",
        model: "JKM630N",
        powerWp: 630,
        library: "competitor",
      },
      ...(topconPresetModules as ModuleRecord[]),
    ];
    const withDefaults = applyCompetitorCatalogDefaults(seed);
    expect(filterCatalogVisible(withDefaults)).toHaveLength(3);
    expect(
      withDefaults.find((m) => m.id === "mod_competitor_jinko_jkm630n")?.catalogHidden
    ).toBe(true);
    expect(
      withDefaults.find((m) => m.id === "mod_competitor_topcon_topcon_620w")?.catalogHidden
    ).toBeUndefined();
  });

  it("recognizes Topcon preset ids", () => {
    expect(isTopconPresetModuleId("mod_competitor_topcon_topcon_475w")).toBe(true);
    expect(isTopconPresetModuleId("mod_competitor_jinko_jkm630n")).toBe(false);
  });
});
