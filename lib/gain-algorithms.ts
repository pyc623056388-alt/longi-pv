import {
  LOW_LIGHT_IRRADIANCE_LEVELS,
  type AntiShadingScenario,
  type GainRuleId,
  type GainStrategies,
  type LowLightIrradianceWm2,
} from "./pv-types";
import type { ModuleSpec } from "./pv-calculation";

/** @todo 市场部确认 — 场景基准抗遮挡增益（%） */
export const ANTI_SHADING_PCT: Record<AntiShadingScenario, number> = {
  residential: 1.2,
  commercial: 0.4,
};

/** 无 PAN 弱光曲线时的标准规则增益（%） */
export const STANDARD_LOW_LIGHT_PCT = 0.8;

/** PAN 加权差值增益上限（%），与 BC 白皮书系统级弱光贡献量级对齐 */
export const LOW_LIGHT_GAIN_PAN_MAX_PCT = 1.2;

/** 晨昏/多云场景下各辐照档权重（和为 1） */
export const LOW_LIGHT_IRRADIANCE_WEIGHTS: Record<LowLightIrradianceWm2, number> = {
  200: 0.15,
  400: 0.25,
  600: 0.3,
  800: 0.3,
};

export interface AntiShadingGainBreakdown {
  scenario: AntiShadingScenario;
  gainPct: number;
}

export function antiShadingGainBreakdown(
  scenario: AntiShadingScenario = "residential"
): AntiShadingGainBreakdown {
  return { scenario, gainPct: ANTI_SHADING_PCT[scenario] };
}

/** STC 标准测试电池温度（°C） */
export const REF_TEMP_C = 25;

/** 默认工作温升 ΔT（°C），对应 T_cell ≈ 50°C，与研究文档举例一致 */
export const DEFAULT_DELTA_T_C = 25;

export interface TemperatureGainOptions {
  /** 工作温升 ΔT = T_cell − REF_TEMP_C（°C） */
  deltaT?: number;
}

export interface TemperatureGainBreakdown {
  gammaLongiPct: number;
  gammaCompPct: number;
  deltaT: number;
  longiLossPct: number;
  compLossPct: number;
  gainPct: number;
}

/** PVsyst：Tcell = Tamb + (1/U) × Alpha × Ginc × (1 − Effic) */
export function computeCellTemperatureC(params: {
  tambC: number;
  gincWm2: number;
  moduleEfficiency: number;
  heatLossU?: number;
  alpha?: number;
}): number {
  const u = params.heatLossU ?? 29;
  const alpha = params.alpha ?? 0.9;
  const { tambC, gincWm2, moduleEfficiency } = params;
  return tambC + (1 / u) * alpha * gincWm2 * (1 - moduleEfficiency);
}

export function deltaTFromCellTemp(tCellC: number): number {
  return tCellC - REF_TEMP_C;
}

/** 温度系数增益分解（简单式 ①） */
export function temperatureGainBreakdown(
  longi: ModuleSpec,
  competitor: ModuleSpec,
  options?: TemperatureGainOptions
): TemperatureGainBreakdown {
  const gammaLongiPct = Math.abs(parseNum(longi.tempCoef, 0.26));
  const gammaCompPct = Math.abs(parseNum(competitor.tempCoef, 0.29));
  const deltaT = options?.deltaT ?? DEFAULT_DELTA_T_C;
  const longiLossPct = gammaLongiPct * deltaT;
  const compLossPct = gammaCompPct * deltaT;
  const gainPct = Math.max(0, compLossPct - longiLossPct);
  return {
    gammaLongiPct,
    gammaCompPct,
    deltaT,
    longiLossPct,
    compLossPct,
    gainPct,
  };
}

/** 温度系数增益：隆基相对竞品的额外发电比例（%），简单式 ① */
export function temperatureGainPct(
  longi: ModuleSpec,
  competitor: ModuleSpec,
  options?: TemperatureGainOptions
): number {
  return temperatureGainBreakdown(longi, competitor, options).gainPct;
}

export function antiShadingGainPct(
  _ruleId: GainRuleId,
  scenario: AntiShadingScenario = "residential"
): number {
  return ANTI_SHADING_PCT[scenario];
}

export interface LowLightGainPoint {
  irradianceWm2: LowLightIrradianceWm2;
  longiRelEfficPct: number;
  compRelEfficPct: number;
  deltaPct: number;
  weight: number;
  weightedContributionPct: number;
}

export interface LowLightGainBreakdown {
  points: LowLightGainPoint[];
  gainPanPct: number;
  gainPct: number;
  source: "pan" | "standard";
  ruleId: GainRuleId;
}

function clampLowLightGain(pct: number): number {
  return Math.min(
    LOW_LIGHT_GAIN_PAN_MAX_PCT,
    Math.max(0, pct)
  );
}

export function hasCompleteLowLightProfile(spec: ModuleSpec): boolean {
  const rel = spec.lowLightRelEffic;
  if (!rel) return false;
  return LOW_LIGHT_IRRADIANCE_LEVELS.every(
    (g) => rel[g] !== undefined && Number.isFinite(rel[g])
  );
}

function computeWeightedPanGain(
  longi: ModuleSpec,
  competitor: ModuleSpec
): { points: LowLightGainPoint[]; gainPanPct: number } {
  const longiRel = longi.lowLightRelEffic!;
  const compRel = competitor.lowLightRelEffic!;
  const points: LowLightGainPoint[] = [];
  let gainPanPct = 0;

  for (const g of LOW_LIGHT_IRRADIANCE_LEVELS) {
    const longiRelEfficPct = longiRel[g]!;
    const compRelEfficPct = compRel[g]!;
    const deltaPct = longiRelEfficPct - compRelEfficPct;
    const weight = LOW_LIGHT_IRRADIANCE_WEIGHTS[g];
    const weightedContributionPct = weight * Math.max(0, deltaPct);
    gainPanPct += weightedContributionPct;
    points.push({
      irradianceWm2: g,
      longiRelEfficPct,
      compRelEfficPct,
      deltaPct,
      weight,
      weightedContributionPct,
    });
  }

  return { points, gainPanPct };
}

/** 弱光增益分解：PAN RelEffic 加权差值，缺省 0.8% */
export function lowLightGainBreakdown(
  longi: ModuleSpec,
  competitor: ModuleSpec,
  ruleId: GainRuleId = "standard"
): LowLightGainBreakdown {
  if (ruleId === "conservative") {
    return {
      points: [],
      gainPanPct: 0,
      gainPct: STANDARD_LOW_LIGHT_PCT,
      source: "standard",
      ruleId,
    };
  }

  const canUsePan =
    hasCompleteLowLightProfile(longi) && hasCompleteLowLightProfile(competitor);

  if (ruleId === "pan") {
    if (!canUsePan) {
      return {
        points: [],
        gainPanPct: 0,
        gainPct: 0,
        source: "pan",
        ruleId,
      };
    }
    const { points, gainPanPct } = computeWeightedPanGain(longi, competitor);
    return {
      points,
      gainPanPct,
      gainPct: clampLowLightGain(gainPanPct),
      source: "pan",
      ruleId,
    };
  }

  if (canUsePan) {
    const { points, gainPanPct } = computeWeightedPanGain(longi, competitor);
    return {
      points,
      gainPanPct,
      gainPct: clampLowLightGain(gainPanPct),
      source: "pan",
      ruleId,
    };
  }

  return {
    points: [],
    gainPanPct: 0,
    gainPct: STANDARD_LOW_LIGHT_PCT,
    source: "standard",
    ruleId,
  };
}

export function lowLightGainPct(
  longi: ModuleSpec,
  competitor: ModuleSpec,
  ruleId: GainRuleId = "standard"
): number {
  return lowLightGainBreakdown(longi, competitor, ruleId).gainPct;
}

export type GainStrategyKey = keyof GainStrategies;

/** 单项策略对隆基发电量的增益百分比（%），与 longiStrategyGainMultiplier 内分项一致 */
export function strategyGainPct(
  key: GainStrategyKey,
  longi: ModuleSpec,
  competitor: ModuleSpec,
  strategies: GainStrategies
): number {
  switch (key) {
    case "temperature":
      return temperatureGainPct(longi, competitor);
    case "antiShading":
      return antiShadingGainPct(
        strategies.antiShading.ruleId,
        strategies.antiShading.scenario
      );
    case "lowLight":
      return lowLightGainPct(
        longi,
        competitor,
        strategies.lowLight.ruleId
      );
    default:
      return 0;
  }
}

/** 隆基侧附加增益乘子（1 + 已启用策略增益%之和） */
export function longiStrategyGainMultiplier(
  longi: ModuleSpec,
  competitor: ModuleSpec,
  strategies: GainStrategies
): number {
  let extraPct = 0;
  if (strategies.temperature.enabled) {
    extraPct += temperatureGainPct(longi, competitor);
  }
  if (strategies.antiShading.enabled) {
    extraPct += antiShadingGainPct(
      strategies.antiShading.ruleId,
      strategies.antiShading.scenario
    );
  }
  if (strategies.lowLight.enabled) {
    extraPct += lowLightGainPct(
      longi,
      competitor,
      strategies.lowLight.ruleId
    );
  }
  return 1 + extraPct / 100;
}

/** 隆基侧性能乘子（相对竞品基准的组件品质优势，不含三项可选策略） */
export function longiBasePerformanceFactor(
  longi: ModuleSpec,
  competitor: ModuleSpec
): number {
  const tempDelta =
    Math.abs(parseNum(competitor.tempCoef, 0.29)) -
    Math.abs(parseNum(longi.tempCoef, 0.26));
  const degDelta =
    parseNum(competitor.firstYearDeg, 1) -
    parseNum(longi.firstYearDeg, 0.8) +
    (parseNum(competitor.annualDeg, 0.4) - parseNum(longi.annualDeg, 0.35)) * 10;
  return 1 + tempDelta * 0.02 + degDelta * 0.008;
}

function parseNum(value: string, fallback: number): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}
