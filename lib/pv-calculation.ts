import {
  longiBasePerformanceFactor,
  longiStrategyGainMultiplier,
} from "./gain-algorithms";
import { getMessages, type AppLocale } from "./i18n";
import type { ResultMetricId } from "./i18n/types";
import { staticPaybackYears } from "./payback-audit";
import type { BasicParams, GainStrategies, LowLightRelEffic } from "./pv-types";

export interface ModuleSpec {
  power: string;
  tempCoef: string;
  firstYearDeg: string;
  annualDeg: string;
  price: string;
  dimensions?: string;
  name?: string;
  /** PAN RelEffic200/400/600/800：相对 STC 的弱光相对效率（%） */
  lowLightRelEffic?: LowLightRelEffic;
}

export interface PvComparisonInput {
  moduleCount: number;
  mode: "sameCount" | "fixedCapacity";
  longi: ModuleSpec;
  competitor: ModuleSpec;
  basicParams: BasicParams;
  gainStrategies: GainStrategies;
  modulesPerString?: number;
  stringCount?: number;
  locale?: AppLocale;
}

export interface ResultMetricRow {
  metricId: ResultMetricId;
  metric: string;
  longi: string;
  competitor: string;
  delta: string;
}

export interface PvComparisonResult {
  longiModuleCount: number;
  compModuleCount: number;
  longiCapacityKw: number;
  compCapacityKw: number;
  longiYieldMwh: number;
  compYieldMwh: number;
  longiModuleCost: number;
  compModuleCost: number;
  longiAccessoryCost: number;
  compAccessoryCost: number;
  longiProjectCost: number;
  compProjectCost: number;
  longiRevenue: number;
  compRevenue: number;
  longiNetProfit: number;
  compNetProfit: number;
  longiPaybackYears: number;
  compPaybackYears: number;
  longiFirstYearRevenue: number;
  compFirstYearRevenue: number;
  longiStaticPaybackYears: number;
  compStaticPaybackYears: number;
  yieldGainPct: number;
  costReductionPct: number;
  accessoryReductionPct: number;
  netProfitGainPct: number;
  paybackReductionYears: number;
  chartData: Array<{
    name: string;
    yield: number;
    cost: number;
    accessory: number;
    netProfit: number;
    payback: number;
  }>;
  rows: ResultMetricRow[];
  longiLabel: string;
  compLabel: string;
}

function parseNum(value: string, fallback = 0): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

function lifetimeYieldFactor(
  firstYearPct: number,
  annualPct: number,
  years: number
): number {
  const fy = firstYearPct / 100;
  const annual = annualPct / 100;
  let sum = 0;
  for (let y = 1; y <= years; y++) {
    sum += (1 - fy) * Math.pow(1 - annual, y - 1);
  }
  return sum;
}

function pctDelta(longi: number, comp: number): string {
  if (comp === 0) return "—";
  const pct = ((longi - comp) / comp) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

function yearDelta(longi: number, comp: number): string {
  const diff = longi - comp;
  const sign = diff >= 0 ? "+" : "";
  return `${sign}${diff.toFixed(3)}`;
}

export interface DynamicPaybackInput {
  projectCost: number;
  annualMwhYear1: number;
  firstYearDegPct: number;
  annualDegPct: number;
  ppa: number;
  maxYears: number;
}

/** 动态投资回收期：累计售电收入（含衰减）直至 ≥ 全站投资；未回本返回 null */
export function dynamicPaybackYears(input: DynamicPaybackInput): number | null {
  const {
    projectCost,
    annualMwhYear1,
    firstYearDegPct,
    annualDegPct,
    ppa,
    maxYears,
  } = input;

  if (projectCost <= 0) return 0;
  if (annualMwhYear1 <= 0 || ppa <= 0 || maxYears < 1) return null;

  const fy = firstYearDegPct / 100;
  const annual = annualDegPct / 100;
  let cumulative = 0;

  for (let y = 1; y <= maxYears; y++) {
    const yearMwh = annualMwhYear1 * (1 - fy) * Math.pow(1 - annual, y - 1);
    const revenue = yearMwh * 1000 * ppa;
    const prevCumulative = cumulative;
    cumulative += revenue;
    if (cumulative >= projectCost) {
      const fraction = revenue > 0 ? (projectCost - prevCumulative) / revenue : 0;
      return y - 1 + Math.min(1, Math.max(0, fraction));
    }
  }

  return null;
}

/** 运维年限内未回本时用于图表的占位年数 */
export function paybackBeyondHorizonValue(maxYears: number): number {
  return maxYears + 1;
}

export function isPaybackBeyondHorizon(
  years: number,
  maxYears: number
): boolean {
  return years > maxYears + 1e-6;
}

export function formatPaybackYears(years: number, maxYears: number): string {
  if (!Number.isFinite(years) || isPaybackBeyondHorizon(years, maxYears)) {
    return `>${maxYears}`;
  }
  return years.toFixed(2);
}

export function calculatePvComparison(input: PvComparisonInput): PvComparisonResult {
  const {
    moduleCount,
    mode,
    longi,
    competitor,
    basicParams,
    gainStrategies,
    modulesPerString = 0,
    stringCount = 0,
    locale = "zh",
  } = input;
  const m = getMessages(locale);
  const metricLabel = (id: ResultMetricId) => m.resultMetrics[id];

  const longiW = parseNum(longi.power, 590);
  const compW = parseNum(competitor.power, 580);
  const longiPrice = parseNum(longi.price, 0.25);
  const compPrice = parseNum(competitor.price, 0.23);
  const yearlyHours = basicParams.yearlyEquivalentHours;
  const opYears = basicParams.operationYears;
  const ppa = basicParams.ppaPrice;
  const accessory = basicParams.accessoryCostPerModule;

  let longiModuleCount: number;
  let compModuleCount: number;

  const useStringConfig = modulesPerString > 0 && stringCount > 0;
  const blocksFromStrings = useStringConfig
    ? modulesPerString * stringCount
    : moduleCount;

  if (mode === "fixedCapacity") {
    longiModuleCount = Math.floor((moduleCount * 1000) / longiW);
    compModuleCount = Math.floor((moduleCount * 1000) / compW);
    if (longiModuleCount < 1) longiModuleCount = 1;
    if (compModuleCount < 1) compModuleCount = 1;
  } else {
    longiModuleCount = blocksFromStrings;
    compModuleCount = blocksFromStrings;
  }

  const longiCapacityKw = (longiModuleCount * longiW) / 1000;
  const compCapacityKw = (compModuleCount * compW) / 1000;

  const annualBaseLongiMwh = (longiCapacityKw * yearlyHours) / 1000;
  const annualBaseCompMwh = (compCapacityKw * yearlyHours) / 1000;

  const longiPerf = longiBasePerformanceFactor(longi, competitor);
  const longiGainMult = longiStrategyGainMultiplier(
    longi,
    competitor,
    gainStrategies
  );

  const longiAnnualMwh = annualBaseLongiMwh * longiPerf * longiGainMult;
  const compAnnualMwh = annualBaseCompMwh;

  const longiLifeFactor = lifetimeYieldFactor(
    parseNum(longi.firstYearDeg, 0.8),
    parseNum(longi.annualDeg, 0.35),
    opYears
  );
  const compLifeFactor = lifetimeYieldFactor(
    parseNum(competitor.firstYearDeg, 1),
    parseNum(competitor.annualDeg, 0.4),
    opYears
  );

  const longiYieldMwh = longiAnnualMwh * longiLifeFactor;
  const compYieldMwh = compAnnualMwh * compLifeFactor;

  const longiModuleCost = longiModuleCount * longiW * longiPrice;
  const compModuleCost = compModuleCount * compW * compPrice;
  const longiAccessoryCost = longiModuleCount * accessory;
  const compAccessoryCost = compModuleCount * accessory;
  const longiProjectCost = longiModuleCost + longiAccessoryCost;
  const compProjectCost = compModuleCost + compAccessoryCost;

  const longiFirstYearRevenue = longiAnnualMwh * 1000 * ppa;
  const compFirstYearRevenue = compAnnualMwh * 1000 * ppa;
  const longiRevenue = longiYieldMwh * 1000 * ppa;
  const compRevenue = compYieldMwh * 1000 * ppa;
  const longiNetProfit = longiRevenue - longiProjectCost;
  const compNetProfit = compRevenue - compProjectCost;

  const longiStaticPaybackYears = staticPaybackYears(
    longiProjectCost,
    longiFirstYearRevenue
  );
  const compStaticPaybackYears = staticPaybackYears(
    compProjectCost,
    compFirstYearRevenue
  );

  const longiDeg = parseNum(longi.firstYearDeg, 0.8);
  const longiAnnualDeg = parseNum(longi.annualDeg, 0.35);
  const compDeg = parseNum(competitor.firstYearDeg, 1);
  const compAnnualDeg = parseNum(competitor.annualDeg, 0.4);

  const longiPaybackRaw = dynamicPaybackYears({
    projectCost: longiProjectCost,
    annualMwhYear1: longiAnnualMwh,
    firstYearDegPct: longiDeg,
    annualDegPct: longiAnnualDeg,
    ppa,
    maxYears: opYears,
  });
  const compPaybackRaw = dynamicPaybackYears({
    projectCost: compProjectCost,
    annualMwhYear1: compAnnualMwh,
    firstYearDegPct: compDeg,
    annualDegPct: compAnnualDeg,
    ppa,
    maxYears: opYears,
  });

  const longiPaybackYears =
    longiPaybackRaw ?? paybackBeyondHorizonValue(opYears);
  const compPaybackYears =
    compPaybackRaw ?? paybackBeyondHorizonValue(opYears);

  const yieldGainPct =
    compYieldMwh > 0 ? ((longiYieldMwh - compYieldMwh) / compYieldMwh) * 100 : 0;

  const costReductionPct =
    compProjectCost > 0
      ? ((compProjectCost - longiProjectCost) / compProjectCost) * 100
      : 0;

  const accessoryReductionPct =
    compAccessoryCost > 0
      ? ((compAccessoryCost - longiAccessoryCost) / compAccessoryCost) * 100
      : 0;

  const netProfitGainPct =
    compNetProfit > 0
      ? ((longiNetProfit - compNetProfit) / compNetProfit) * 100
      : 0;

  const paybackReductionYears = compPaybackYears - longiPaybackYears;

  const longiLabel = longi.name || m.common.longiModule;
  const compLabel = competitor.name || m.common.competitorModule;

  const fmt = (n: number, digits = 2) =>
    n.toLocaleString(m.numberLocale, { maximumFractionDigits: digits });

  const rows: ResultMetricRow[] = [
    {
      metricId: "moduleCount",
      metric: metricLabel("moduleCount"),
      longi: String(longiModuleCount),
      competitor: String(compModuleCount),
      delta: pctDelta(longiModuleCount, compModuleCount),
    },
    {
      metricId: "capacity",
      metric: metricLabel("capacity"),
      longi: fmt(longiCapacityKw, 2),
      competitor: fmt(compCapacityKw, 2),
      delta: pctDelta(longiCapacityKw, compCapacityKw),
    },
    {
      metricId: "firstYearYield",
      metric: metricLabel("firstYearYield"),
      longi: fmt(longiAnnualMwh, 2),
      competitor: fmt(compAnnualMwh, 2),
      delta: pctDelta(longiAnnualMwh, compAnnualMwh),
    },
    {
      metricId: "lifetimeYield",
      metric: metricLabel("lifetimeYield"),
      longi: fmt(longiYieldMwh, 2),
      competitor: fmt(compYieldMwh, 2),
      delta: pctDelta(longiYieldMwh, compYieldMwh),
    },
    {
      metricId: "firstYearRevenue",
      metric: metricLabel("firstYearRevenue"),
      longi: fmt(longiFirstYearRevenue, 2),
      competitor: fmt(compFirstYearRevenue, 2),
      delta: pctDelta(longiFirstYearRevenue, compFirstYearRevenue),
    },
    {
      metricId: "lifetimeRevenue",
      metric: metricLabel("lifetimeRevenue"),
      longi: fmt(longiRevenue, 2),
      competitor: fmt(compRevenue, 2),
      delta: pctDelta(longiRevenue, compRevenue),
    },
    {
      metricId: "moduleCost",
      metric: metricLabel("moduleCost"),
      longi: fmt(longiModuleCost, 2),
      competitor: fmt(compModuleCost, 2),
      delta: pctDelta(longiModuleCost, compModuleCost),
    },
    {
      metricId: "accessoryCost",
      metric: metricLabel("accessoryCost"),
      longi: fmt(longiAccessoryCost, 2),
      competitor: fmt(compAccessoryCost, 2),
      delta: pctDelta(longiAccessoryCost, compAccessoryCost),
    },
    {
      metricId: "projectCost",
      metric: metricLabel("projectCost"),
      longi: fmt(longiProjectCost, 2),
      competitor: fmt(compProjectCost, 2),
      delta: pctDelta(longiProjectCost, compProjectCost),
    },
    {
      metricId: "netProfit",
      metric: metricLabel("netProfit"),
      longi: fmt(longiNetProfit, 2),
      competitor: fmt(compNetProfit, 2),
      delta: pctDelta(longiNetProfit, compNetProfit),
    },
    {
      metricId: "staticPayback",
      metric: metricLabel("staticPayback"),
      longi: formatPaybackYears(longiStaticPaybackYears, opYears),
      competitor: formatPaybackYears(compStaticPaybackYears, opYears),
      delta: yearDelta(longiStaticPaybackYears, compStaticPaybackYears),
    },
    {
      metricId: "dynamicPayback",
      metric: metricLabel("dynamicPayback"),
      longi: formatPaybackYears(longiPaybackYears, opYears),
      competitor: formatPaybackYears(compPaybackYears, opYears),
      delta: yearDelta(longiPaybackYears, compPaybackYears),
    },
  ];

  return {
    longiModuleCount,
    compModuleCount,
    longiCapacityKw: round(longiCapacityKw, 2),
    compCapacityKw: round(compCapacityKw, 2),
    longiYieldMwh: round(longiYieldMwh, 2),
    compYieldMwh: round(compYieldMwh, 2),
    longiModuleCost: round(longiModuleCost, 2),
    compModuleCost: round(compModuleCost, 2),
    longiAccessoryCost: round(longiAccessoryCost, 2),
    compAccessoryCost: round(compAccessoryCost, 2),
    longiProjectCost: round(longiProjectCost, 2),
    compProjectCost: round(compProjectCost, 2),
    longiRevenue: round(longiRevenue, 2),
    compRevenue: round(compRevenue, 2),
    longiNetProfit: round(longiNetProfit, 2),
    compNetProfit: round(compNetProfit, 2),
    longiPaybackYears: round(longiPaybackYears, 3),
    compPaybackYears: round(compPaybackYears, 3),
    longiFirstYearRevenue: round(longiFirstYearRevenue, 2),
    compFirstYearRevenue: round(compFirstYearRevenue, 2),
    longiStaticPaybackYears: round(longiStaticPaybackYears, 3),
    compStaticPaybackYears: round(compStaticPaybackYears, 3),
    yieldGainPct: round(yieldGainPct, 2),
    costReductionPct: round(costReductionPct, 2),
    accessoryReductionPct: round(accessoryReductionPct, 2),
    netProfitGainPct: round(netProfitGainPct, 2),
    paybackReductionYears: round(paybackReductionYears, 2),
    chartData: [
      {
        name: m.chart.longi,
        yield: round(longiYieldMwh, 0),
        cost: round(longiProjectCost, 0),
        accessory: round(longiAccessoryCost, 0),
        netProfit: round(longiNetProfit, 0),
        payback: round(longiPaybackYears, 2),
      },
      {
        name: m.chart.competitor,
        yield: round(compYieldMwh, 0),
        cost: round(compProjectCost, 0),
        accessory: round(compAccessoryCost, 0),
        netProfit: round(compNetProfit, 0),
        payback: round(compPaybackYears, 2),
      },
    ],
    rows,
    longiLabel,
    compLabel,
  };
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
