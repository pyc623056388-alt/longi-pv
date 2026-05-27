import type { ModuleRecord } from "./pv-types";

/** 竞品库 UI 默认可见的 Topcon 预设 id */
export const TOPCON_PRESET_MODULE_IDS = [
  "mod_competitor_topcon_topcon_475w",
  "mod_competitor_topcon_topcon_510w",
  "mod_competitor_topcon_topcon_620w",
] as const;

const TOPCON_PRESET_ID_SET = new Set<string>(TOPCON_PRESET_MODULE_IDS);

export function isTopconPresetModuleId(id: string): boolean {
  return TOPCON_PRESET_ID_SET.has(id);
}

export function isModuleCatalogVisible(module: ModuleRecord): boolean {
  return module.catalogHidden !== true;
}

export function filterCatalogVisible(modules: ModuleRecord[]): ModuleRecord[] {
  return modules.filter(isModuleCatalogVisible);
}

/** 为 seed 竞品写入 catalogHidden；Topcon 预设保持可见 */
export function applyCompetitorCatalogDefaults(
  modules: ModuleRecord[]
): ModuleRecord[] {
  return modules.map((m) => {
    if (isTopconPresetModuleId(m.id)) {
      const { catalogHidden: _, ...rest } = m;
      return rest;
    }
    return { ...m, catalogHidden: true };
  });
}

/** 按 seed 模板合并 catalogHidden；Topcon 预设整条覆盖 */
export function mergeCompetitorModulesFromSeed(
  stored: ModuleRecord[],
  seedCompetitor: ModuleRecord[],
  topconPresets: ModuleRecord[]
): ModuleRecord[] {
  const seedById = new Map(seedCompetitor.map((m) => [m.id, m]));
  const presetById = new Map(topconPresets.map((m) => [m.id, m]));

  const merged = stored.map((m) => {
    if (presetById.has(m.id)) {
      return { ...presetById.get(m.id)! };
    }
    const seed = seedById.get(m.id);
    if (seed) {
      return { ...m, catalogHidden: seed.catalogHidden };
    }
    return m;
  });

  const mergedIds = new Set(merged.map((m) => m.id));
  for (const preset of topconPresets) {
    if (!mergedIds.has(preset.id)) merged.push({ ...preset });
  }
  for (const seed of seedCompetitor) {
    if (!mergedIds.has(seed.id)) merged.push({ ...seed });
  }

  return merged;
}
