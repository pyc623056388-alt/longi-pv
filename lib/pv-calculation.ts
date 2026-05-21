import {
  longiBasePerformanceFactor,
  longiStrategyGainMultiplier,
} from "./gain-algorithms";
import type { BasicParams, GainStrategies } from "./pv-types";

export interface ModuleSpec {
  power: string;
  tempCoef: string;
  firstYearDeg: string;
  annualDeg: string;
  price: string;
  dimensions?: string;
  name?: string;
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
}

export interface ResultMetricRow {
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
  yieldGainPct: number;
  chartData: Array<{
    name: string;
    yield: number;
    cost: number;
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
  } = input;

  const longiW = parseNum(longi.power, 590);
  const compW = parseNum(competitor.power, 580);
  const longiPrice = parseNum(longi.price, 0.95);
  const compPrice = parseNum(competitor.price, 0.88);
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
    parseNum(longi.firstYearDeg, 1),
    parseNum(longi.annualDeg, 0.4),
    opYears
  );
  const compLifeFactor = lifetimeYieldFactor(
    parseNum(competitor.firstYearDeg, 1.5),
    parseNum(competitor.annualDeg, 0.45),
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

  const longiRevenue = longiYieldMwh * 1000 * ppa;
  const compRevenue = compYieldMwh * 1000 * ppa;
  const longiNetProfit = longiRevenue - longiProjectCost;
  const compNetProfit = compRevenue - compProjectCost;

  const longiPaybackYears =
    longiRevenue > 0 ? longiProjectCost / (longiAnnualMwh * 1000 * ppa) : 0;
  const compPaybackYears =
    compRevenue > 0 ? compProjectCost / (compAnnualMwh * 1000 * ppa) : 0;

  const yieldGainPct =
    compYieldMwh > 0 ? ((longiYieldMwh - compYieldMwh) / compYieldMwh) * 100 : 0;

  const longiLabel = longi.name || "隆基组件";
  const compLabel = competitor.name || "竞品组件";

  const fmt = (n: number, digits = 2) =>
    n.toLocaleString("zh-CN", { maximumFractionDigits: digits });

  const rows: ResultMetricRow[] = [
    {
      metric: "组件块数",
      longi: String(longiModuleCount),
      competitor: String(compModuleCount),
      delta: pctDelta(longiModuleCount, compModuleCount),
    },
    {
      metric: "实际装机容量 (kW)",
      longi: fmt(longiCapacityKw, 2),
      competitor: fmt(compCapacityKw, 2),
      delta: pctDelta(longiCapacityKw, compCapacityKw),
    },
    {
      metric: "预期发电量 (MWh)",
      longi: fmt(longiYieldMwh, 2),
      competitor: fmt(compYieldMwh, 2),
      delta: pctDelta(longiYieldMwh, compYieldMwh),
    },
    {
      metric: "总发电收益",
      longi: fmt(longiRevenue, 2),
      competitor: fmt(compRevenue, 2),
      delta: pctDelta(longiRevenue, compRevenue),
    },
    {
      metric: "组件总成本",
      longi: fmt(longiModuleCost, 2),
      competitor: fmt(compModuleCost, 2),
      delta: pctDelta(longiModuleCost, compModuleCost),
    },
    {
      metric: "配件总成本",
      longi: fmt(longiAccessoryCost, 2),
      competitor: fmt(compAccessoryCost, 2),
      delta: pctDelta(longiAccessoryCost, compAccessoryCost),
    },
    {
      metric: "项目总成本",
      longi: fmt(longiProjectCost, 2),
      competitor: fmt(compProjectCost, 2),
      delta: pctDelta(longiProjectCost, compProjectCost),
    },
    {
      metric: "净收益",
      longi: fmt(longiNetProfit, 2),
      competitor: fmt(compNetProfit, 2),
      delta: pctDelta(longiNetProfit, compNetProfit),
    },
    {
      metric: "回收期 (年)",
      longi: fmt(longiPaybackYears, 3),
      competitor: fmt(compPaybackYears, 3),
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
    yieldGainPct: round(yieldGainPct, 2),
    chartData: [
      {
        name: "隆基",
        yield: round(longiYieldMwh, 0),
        cost: round(longiProjectCost, 0),
        payback: round(longiPaybackYears, 2),
      },
      {
        name: "竞品",
        yield: round(compYieldMwh, 0),
        cost: round(compProjectCost, 0),
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
