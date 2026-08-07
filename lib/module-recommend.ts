import { inferCellCountFromModel } from "./product-graphics";
import type { ModuleRecord } from "./pv-types";
import {
  inferModuleVariantFeatures,
  type ModuleVariantFeatures,
} from "./module-variant";

/** 客户需求勾选项 → 自动匹配隆基版型 */
export type ModuleNeedId =
  | "antiHotspot"
  | "antiDust"
  | "antiGlare"
  | "antiShading"
  | "lightweight";

export type ModulePowerBand = 475 | 540 | 650;

export const MODULE_POWER_BANDS: ModulePowerBand[] = [475, 540, 650];

export const MODULE_NEED_IDS: ModuleNeedId[] = [
  "antiHotspot",
  "antiDust",
  "antiGlare",
  "antiShading",
  "lightweight",
];

export type ModuleNeedPreferences = Partial<Record<ModuleNeedId, boolean>>;

export const DEFAULT_MODULE_NEED_PREFERENCES: ModuleNeedPreferences = {
  antiHotspot: false,
  antiDust: false,
  antiGlare: false,
  antiShading: false,
  lightweight: false,
};

export interface RecommendModuleOptions {
  powerWp: number;
  preferences: ModuleNeedPreferences;
  preferredCellCount?: 54 | 60 | 72;
}

export interface RecommendModuleResult {
  module: ModuleRecord | undefined;
  score: number;
  matchedNeeds: ModuleNeedId[];
  missingNeeds: ModuleNeedId[];
  reason: "exact" | "partial" | "power_only" | "none";
}

function lr7SortKey(model: string): number {
  return /^LR7/i.test(model) ? 0 : 1;
}

function activeNeeds(prefs: ModuleNeedPreferences): ModuleNeedId[] {
  return MODULE_NEED_IDS.filter((id) => prefs[id]);
}

function featuresMatchNeed(
  features: ModuleVariantFeatures,
  need: ModuleNeedId
): boolean {
  return Boolean(features[need]);
}

function scoreCandidate(
  features: ModuleVariantFeatures,
  prefs: ModuleNeedPreferences
): { score: number; matched: ModuleNeedId[]; missing: ModuleNeedId[] } {
  const needs = activeNeeds(prefs);
  if (!needs.length) {
    // 无特殊需求时偏好标准非 F、非轻质 HVH
    let score = 0;
    if (features.family === "hvh" && !features.antiDust && !features.lightweight) {
      score += 30;
    } else if (!features.antiDust && !features.lightweight) {
      score += 10;
    }
    return { score, matched: [], missing: [] };
  }

  const matched: ModuleNeedId[] = [];
  const missing: ModuleNeedId[] = [];
  let score = 0;

  for (const need of needs) {
    if (featuresMatchNeed(features, need)) {
      matched.push(need);
      // 防积灰 / 轻质是强区分特征，权重更高
      score += need === "antiDust" || need === "lightweight" ? 40 : 15;
    } else {
      missing.push(need);
      score -= need === "antiDust" || need === "lightweight" ? 50 : 8;
    }
  }

  // 未勾选防积灰时，略微惩罚 F 版型，避免无故选到防积灰
  if (!prefs.antiDust && features.antiDust) score -= 12;
  // 未勾选轻质时惩罚轻质版
  if (!prefs.lightweight && features.lightweight) score -= 12;

  return { score, matched, missing };
}

function defaultCellCountForPower(powerWp: number): 54 | 60 | 72 | undefined {
  if (powerWp <= 500) return 54;
  if (powerWp <= 580) return 60;
  if (powerWp >= 620) return 72;
  return undefined;
}

/**
 * 按功率档 + 客户需求勾选，在隆基库中自动推荐版型。
 * 例如勾选「防积灰」→ 优先 HVHF / HVDF；勾选「轻质」→ 优先 HVHL。
 */
export function recommendLongiModule(
  modules: ModuleRecord[],
  options: RecommendModuleOptions
): RecommendModuleResult {
  const { powerWp, preferences, preferredCellCount } = options;
  const byPower = modules.filter((m) => m.powerWp === powerWp);
  if (!byPower.length) {
    return {
      module: undefined,
      score: Number.NEGATIVE_INFINITY,
      matchedNeeds: [],
      missingNeeds: activeNeeds(preferences),
      reason: "none",
    };
  }

  const cellHint =
    preferredCellCount ?? defaultCellCountForPower(powerWp);

  type Ranked = {
    module: ModuleRecord;
    score: number;
    matched: ModuleNeedId[];
    missing: ModuleNeedId[];
    cellBonus: number;
  };

  const ranked: Ranked[] = byPower.map((module) => {
    const features = inferModuleVariantFeatures(module.model);
    const { score, matched, missing } = scoreCandidate(features, preferences);
    let cellBonus = 0;
    if (cellHint != null) {
      const cells = inferCellCountFromModel(module.model);
      if (cells === cellHint) cellBonus = 5;
    }
    return { module, score: score + cellBonus, matched, missing, cellBonus };
  });

  ranked.sort(
    (a, b) =>
      b.score - a.score ||
      lr7SortKey(a.module.model) - lr7SortKey(b.module.model) ||
      a.module.model.localeCompare(b.module.model)
  );

  const best = ranked[0];
  const needs = activeNeeds(preferences);
  let reason: RecommendModuleResult["reason"] = "power_only";
  if (!needs.length) {
    reason = "power_only";
  } else if (best.missing.length === 0) {
    reason = "exact";
  } else if (best.matched.length > 0) {
    reason = "partial";
  } else {
    reason = "power_only";
  }

  return {
    module: best.module,
    score: best.score,
    matchedNeeds: best.matched,
    missingNeeds: best.missing,
    reason,
  };
}

export function isModulePowerBand(v: unknown): v is ModulePowerBand {
  return v === 475 || v === 540 || v === 650;
}

export function powerBandFromWp(powerWp: number): ModulePowerBand {
  if (powerWp <= 500) return 475;
  if (powerWp <= 580) return 540;
  return 650;
}

/** 从当前已选型号反推勾选状态（用于 UI 回填） */
export function preferencesFromModuleModel(
  model: string
): ModuleNeedPreferences {
  const f = inferModuleVariantFeatures(model);
  return {
    antiHotspot: f.antiHotspot,
    antiDust: f.antiDust,
    antiGlare: f.antiGlare,
    antiShading: f.antiShading,
    lightweight: f.lightweight,
  };
}
