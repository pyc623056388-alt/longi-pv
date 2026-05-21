import type { GainRuleId, GainStrategies } from "./pv-types";
import type { ModuleSpec } from "./pv-calculation";

const STANDARD_ANTI_SHADING_PCT = 1.2;
const STANDARD_LOW_LIGHT_PCT = 0.8;
const REF_TEMP_C = 25;
const AVG_CELL_TEMP_C = 45;

/** 温度系数增益：隆基相对竞品的额外发电比例（%） */
export function temperatureGainPct(
  longi: ModuleSpec,
  competitor: ModuleSpec
): number {
  const longiTc = Math.abs(parseNum(longi.tempCoef, 0.29));
  const compTc = Math.abs(parseNum(competitor.tempCoef, 0.34));
  const deltaTc = compTc - longiTc;
  const tempDelta = AVG_CELL_TEMP_C - REF_TEMP_C;
  return Math.max(0, deltaTc * tempDelta * 0.1);
}

export function antiShadingGainPct(_ruleId: GainRuleId): number {
  return STANDARD_ANTI_SHADING_PCT;
}

export function lowLightGainPct(_ruleId: GainRuleId): number {
  return STANDARD_LOW_LIGHT_PCT;
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
      return antiShadingGainPct(strategies.antiShading.ruleId);
    case "lowLight":
      return lowLightGainPct(strategies.lowLight.ruleId);
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
    extraPct += antiShadingGainPct(strategies.antiShading.ruleId);
  }
  if (strategies.lowLight.enabled) {
    extraPct += lowLightGainPct(strategies.lowLight.ruleId);
  }
  return 1 + extraPct / 100;
}

/** 隆基侧性能乘子（相对竞品基准的组件品质优势，不含三项可选策略） */
export function longiBasePerformanceFactor(
  longi: ModuleSpec,
  competitor: ModuleSpec
): number {
  const tempDelta =
    Math.abs(parseNum(competitor.tempCoef, 0.34)) -
    Math.abs(parseNum(longi.tempCoef, 0.29));
  const degDelta =
    parseNum(competitor.firstYearDeg, 1.5) -
    parseNum(longi.firstYearDeg, 1.0) +
    (parseNum(competitor.annualDeg, 0.45) - parseNum(longi.annualDeg, 0.4)) * 10;
  return 1 + tempDelta * 0.02 + degDelta * 0.008;
}

function parseNum(value: string, fallback: number): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}
