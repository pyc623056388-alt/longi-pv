import { inferCellCountFromModel } from "./product-graphics";
import type { ModuleSegment, ModuleRecord } from "./pv-types";

export type ModulePairPresetId = "custom" | "bc475" | "bc540" | "bc650";

export const MODULE_PAIR_PRESET_IDS = ["bc475", "bc540", "bc650"] as const;

export type QuickModulePairPresetId = (typeof MODULE_PAIR_PRESET_IDS)[number];

export interface QuickModulePairPreset {
  longiId: string;
  competitorId: string;
  targetPowerWp: number;
  competitorPowerWp: number;
  preferredCellCount: 54 | 60 | 72;
  segment: ModuleSegment;
}

export const QUICK_MODULE_PAIR_PRESETS: Record<
  QuickModulePairPresetId,
  QuickModulePairPreset
> = {
  bc475: {
    longiId: "mod_longi_longi_solar_lr7_54hvh_475m",
    competitorId: "mod_competitor_topcon_topcon_475w",
    targetPowerWp: 475,
    competitorPowerWp: 475,
    preferredCellCount: 54,
    segment: "residential475",
  },
  bc540: {
    longiId: "mod_longi_longi_solar_lr7_60hvh_540m",
    competitorId: "mod_competitor_topcon_topcon_510w",
    targetPowerWp: 540,
    competitorPowerWp: 510,
    preferredCellCount: 60,
    segment: "medium60",
  },
  bc650: {
    longiId: "mod_longi_longi_solar_lr7_72hvh_650m",
    competitorId: "mod_competitor_topcon_topcon_620w",
    targetPowerWp: 650,
    competitorPowerWp: 620,
    preferredCellCount: 72,
    segment: "large620",
  },
};

/** 标准 HVH 版型（排除 HVD / HVHF / HVHL 等变体） */
export function isStandardHvhModel(model: string): boolean {
  const upper = model.toUpperCase();
  if (!upper.includes("HVH")) return false;
  if (/HVD|HVHF|HVHL/.test(upper)) return false;
  return true;
}

function lr7SortKey(model: string): number {
  return /^LR7/i.test(model) ? 0 : 1;
}

/** 同功率隆基库中优先解析 HVH 版型 */
export function resolveLongiHvhModule(
  modules: ModuleRecord[],
  targetPowerWp: number,
  preferredCellCount?: 54 | 60 | 72
): ModuleRecord | undefined {
  const byPower = modules.filter((m) => m.powerWp === targetPowerWp);
  if (!byPower.length) return undefined;

  let candidates = byPower.filter((m) => isStandardHvhModel(m.model));
  if (preferredCellCount != null) {
    const withCell = candidates.filter(
      (m) => inferCellCountFromModel(m.model) === preferredCellCount
    );
    if (withCell.length) candidates = withCell;
  }

  if (candidates.length) {
    candidates.sort(
      (a, b) =>
        lr7SortKey(a.model) - lr7SortKey(b.model) ||
        a.model.localeCompare(b.model)
    );
    return candidates[0];
  }

  return byPower[0];
}

export function resolveCompetitorForPreset(
  modules: ModuleRecord[],
  preset: QuickModulePairPreset
): ModuleRecord | undefined {
  const byId = modules.find((m) => m.id === preset.competitorId);
  if (byId) return byId;

  const byPower = modules.filter((m) => m.powerWp === preset.competitorPowerWp);
  const bySegment = byPower.filter((m) => m.segment === preset.segment);
  if (bySegment[0]) return bySegment[0];
  return byPower[0];
}

export function resolvePresetPairIds(
  presetId: QuickModulePairPresetId,
  longiModules: ModuleRecord[],
  competitorModules: ModuleRecord[]
): { longiId: string; competitorId: string; usedHvhFallback: boolean } {
  const preset = QUICK_MODULE_PAIR_PRESETS[presetId];

  let longi = longiModules.find((m) => m.id === preset.longiId);
  let usedHvhFallback = false;
  if (!longi) {
    longi = resolveLongiHvhModule(
      longiModules,
      preset.targetPowerWp,
      preset.preferredCellCount
    );
    usedHvhFallback = !!longi;
  }

  const competitor = resolveCompetitorForPreset(competitorModules, preset);

  return {
    longiId: longi?.id ?? "",
    competitorId: competitor?.id ?? "",
    usedHvhFallback,
  };
}

export function matchesQuickPreset(
  presetId: QuickModulePairPresetId,
  longiId: string,
  competitorId: string,
  longiModules: ModuleRecord[],
  competitorModules: ModuleRecord[]
): boolean {
  const { longiId: expectedLongi, competitorId: expectedComp } =
    resolvePresetPairIds(presetId, longiModules, competitorModules);
  return longiId === expectedLongi && competitorId === expectedComp;
}

export function findActiveQuickPreset(
  longiId: string,
  competitorId: string,
  longiModules: ModuleRecord[],
  competitorModules: ModuleRecord[]
): QuickModulePairPresetId | null {
  for (const presetId of MODULE_PAIR_PRESET_IDS) {
    if (
      matchesQuickPreset(
        presetId,
        longiId,
        competitorId,
        longiModules,
        competitorModules
      )
    ) {
      return presetId;
    }
  }
  return null;
}

export function isModulePairPresetId(v: unknown): v is ModulePairPresetId {
  return (
    v === "custom" ||
    v === "bc475" ||
    v === "bc540" ||
    v === "bc650"
  );
}

export interface ApplyPresetResult {
  longiId: string;
  competitorId: string;
  warnings: string[];
}

export function applyModulePairPreset(
  presetId: QuickModulePairPresetId,
  longiModules: ModuleRecord[],
  competitorModules: ModuleRecord[],
  messages?: { hvhFallback: string; missingPair: string }
): ApplyPresetResult {
  const warnings: string[] = [];
  const { longiId, competitorId, usedHvhFallback } = resolvePresetPairIds(
    presetId,
    longiModules,
    competitorModules
  );

  if (usedHvhFallback && messages?.hvhFallback) {
    warnings.push(messages.hvhFallback);
  }
  if (!longiId || !competitorId) {
    if (messages?.missingPair) warnings.push(messages.missingPair);
  }

  return { longiId, competitorId, warnings };
}
