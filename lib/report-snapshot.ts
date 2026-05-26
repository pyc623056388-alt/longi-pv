import { strategyGainPct } from "./gain-algorithms";
import { formatDateTime, getMessages, type AppLocale } from "./i18n/index";
import { getReportLabels } from "./report-labels";
import {
  formatPaybackYears,
  type ModuleSpec,
  type PvComparisonResult,
} from "./pv-calculation";
import { moduleDisplayName } from "./module-utils";
import {
  CURRENCY_SYMBOLS,
  type BasicParams,
  type CurrencyCode,
  type GainStrategies,
  type ModuleRecord,
  type WeatherRecord,
} from "./pv-types";
import { getWeatherLocation, getWeatherName } from "./weather-display";
import { highlightVariant, type MetricHighlightVariant } from "./metric-variant";

function currencyLabelForLocale(
  code: CurrencyCode,
  locale: AppLocale
): string {
  if (locale === "en") {
    const en: Record<CurrencyCode, string> = {
      USD: "USD",
      AUD: "AUD",
      NZD: "NZD",
      CNY: "CNY",
    };
    return en[code];
  }
  const zh: Record<CurrencyCode, string> = {
    USD: "美元 USD",
    AUD: "澳元 AUD",
    NZD: "新西兰元 NZD",
    CNY: "人民币 CNY",
  };
  return zh[code];
}

function formatSignedPct(pct: number, digits = 2): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(digits)}`;
}

function formatPctMagnitude(pct: number, digits = 2): string {
  return Math.abs(pct).toFixed(digits);
}

export interface ModuleReportSide {
  displayName: string;
  manufacturer: string;
  model: string;
  power: string;
  dimensions: string;
  tempCoef: string;
  firstYearDeg: string;
  annualDeg: string;
  price: string;
}

export interface GainStrategySummaryLine {
  title: string;
  enabled: boolean;
  detail: string;
}

export interface ReportHighlight {
  title: string;
  value: string;
  unit?: string;
  caption: string;
  variant?: MetricHighlightVariant;
}

export interface ReportSnapshot {
  version: string;
  generatedAt: string;
  projectName: string;
  usedDefaultProjectName: boolean;
  weatherName: string;
  weatherLocation?: string;
  comparisonModeLabel: string;
  quantityLabel: string;
  currencyLabel: string;
  currencyCode: CurrencyCode;
  basicParamsLines: { label: string; value: string }[];
  longi: ModuleReportSide;
  competitor: ModuleReportSide;
  gainStrategies: GainStrategySummaryLine[];
  results: PvComparisonResult;
  highlights: ReportHighlight[];
  chartConfigs: {
    key: "yield" | "cost" | "payback";
    title: string;
    formatValue: (v: number) => string;
  }[];
  disclaimer: string;
  watermark: string;
  attribution: string;
  feedback: string;
  legalNotice: string;
  locale: AppLocale;
}

export interface BuildReportSnapshotInput {
  projectName: string;
  weather?: WeatherRecord;
  comparisonMode: "sameCount" | "fixedCapacity";
  moduleCount: string;
  basicParams: BasicParams;
  gainStrategies: GainStrategies;
  longi: ModuleSpec;
  competitor: ModuleSpec;
  longiRecord?: ModuleRecord;
  compRecord?: ModuleRecord;
  results: PvComparisonResult;
  generatedAt?: Date;
  locale?: AppLocale;
}

function formatGainPct(pct: number): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

function moduleSideFromSpec(
  spec: ModuleSpec,
  record?: ModuleRecord
): ModuleReportSide {
  const manufacturer = record?.manufacturer ?? "—";
  const model = record?.model ?? spec.name ?? "—";
  return {
    displayName: record ? moduleDisplayName(record) : (spec.name ?? model),
    manufacturer,
    model,
    power: spec.power,
    dimensions: spec.dimensions ?? "—",
    tempCoef: spec.tempCoef,
    firstYearDeg: spec.firstYearDeg,
    annualDeg: spec.annualDeg,
    price: spec.price,
  };
}

function buildGainStrategyLines(
  locale: AppLocale,
  strategies: GainStrategies,
  longi: ModuleSpec,
  competitor: ModuleSpec
): GainStrategySummaryLine[] {
  const labels = getReportLabels(locale);
  const m = getMessages(locale);
  const lines: GainStrategySummaryLine[] = [];

  const tempRule = labels.gainRuleLabels[strategies.temperature.ruleId];
  lines.push({
    title: labels.gainStrategyTitles.temperature,
    enabled: strategies.temperature.enabled,
    detail: strategies.temperature.enabled
      ? m.report.gainIncluded(
          tempRule,
          formatGainPct(
            strategyGainPct("temperature", longi, competitor, strategies)
          )
        )
      : m.report.gainExcluded,
  });

  const antiRule = labels.gainRuleLabels[strategies.antiShading.ruleId];
  const scenario =
    labels.antiShadingScenarioLabels[strategies.antiShading.scenario];
  lines.push({
    title: labels.gainStrategyTitles.antiShading,
    enabled: strategies.antiShading.enabled,
    detail: strategies.antiShading.enabled
      ? m.report.gainIncludedWithScenario(
          antiRule,
          scenario,
          formatGainPct(
            strategyGainPct("antiShading", longi, competitor, strategies)
          )
        )
      : m.report.gainExcluded,
  });

  const lowRule = labels.gainRuleLabels[strategies.lowLight.ruleId];
  lines.push({
    title: labels.gainStrategyTitles.lowLight,
    enabled: strategies.lowLight.enabled,
    detail: strategies.lowLight.enabled
      ? m.report.gainIncluded(
          lowRule,
          formatGainPct(
            strategyGainPct("lowLight", longi, competitor, strategies)
          )
        )
      : m.report.gainExcluded,
  });

  return lines;
}

export function buildReportSnapshot(
  input: BuildReportSnapshotInput
): ReportSnapshot {
  const {
    projectName,
    weather,
    comparisonMode,
    moduleCount,
    basicParams,
    gainStrategies,
    longi,
    competitor,
    longiRecord,
    compRecord,
    results,
    generatedAt = new Date(),
    locale = "zh",
  } = input;

  const m = getMessages(locale);
  const reportLabels = getReportLabels(locale);
  const sym = CURRENCY_SYMBOLS[basicParams.currency];
  const count = moduleCount.trim() || "0";
  const quantityLabel =
    comparisonMode === "sameCount"
      ? `${Number(count).toLocaleString(m.numberLocale)} ${m.common.panelUnit}`
      : `${Number(count).toLocaleString(m.numberLocale)} kW`;

  const highlights: ReportHighlight[] = [
    {
      title: m.report.highlights.yieldGain,
      value: formatSignedPct(results.yieldGainPct),
      unit: "%",
      caption:
        results.yieldGainPct >= 0
          ? m.results.charts.yield.captionUp
          : m.results.charts.yield.captionDown,
      variant: highlightVariant(results.yieldGainPct, true),
    },
    {
      title: m.report.highlights.projectCost,
      value: formatPctMagnitude(results.costReductionPct),
      unit: "%",
      caption:
        results.costReductionPct >= 0
          ? m.results.charts.cost.captionDown
          : m.results.charts.cost.captionUp,
      variant: highlightVariant(results.costReductionPct, true),
    },
    {
      title: m.report.highlights.payback,
      value: Math.abs(results.paybackReductionYears).toFixed(2),
      unit: m.common.yearUnit,
      caption:
        results.paybackReductionYears >= 0
          ? m.results.charts.payback.captionShorter
          : m.results.charts.payback.captionLonger,
      variant: highlightVariant(results.paybackReductionYears, true),
    },
  ];

  const trimmedProject = projectName.trim();
  const yearUnit = m.common.yearUnit;

  return {
    version: "0.1.0",
    generatedAt: formatDateTime(locale, generatedAt),
    projectName: trimmedProject || m.common.unnamedProject,
    usedDefaultProjectName: !trimmedProject,
    weatherName: weather
      ? getWeatherName(weather, locale)
      : m.report.noWeather,
    weatherLocation: weather ? getWeatherLocation(weather, locale) : undefined,
    comparisonModeLabel: reportLabels.comparisonModeLabels[comparisonMode],
    quantityLabel,
    currencyLabel: currencyLabelForLocale(basicParams.currency, locale),
    currencyCode: basicParams.currency,
    basicParamsLines: [
      {
        label: m.report.basicParamLabels.tilt,
        value: `${basicParams.tiltDeg}°`,
      },
      {
        label: m.report.basicParamLabels.yearlyHours,
        value: `${basicParams.yearlyEquivalentHours.toLocaleString(m.numberLocale)} h`,
      },
      {
        label: m.report.basicParamLabels.operationYears,
        value: `${basicParams.operationYears} ${yearUnit}`,
      },
      {
        label: m.report.basicParamLabels.ppa,
        value: `${sym}${basicParams.ppaPrice.toFixed(2)}/kWh`,
      },
      {
        label: m.report.basicParamLabels.accessory,
        value: `${sym}${basicParams.accessoryCostPerModule.toFixed(2)}/${m.common.modules}`,
      },
      {
        label: m.report.basicParamLabels.ppaRef,
        value: m.report.basicParamLabels.ppaRefValue(basicParams.currency),
      },
    ],
    longi: moduleSideFromSpec(longi, longiRecord),
    competitor: moduleSideFromSpec(competitor, compRecord),
    gainStrategies: buildGainStrategyLines(
      locale,
      gainStrategies,
      longi,
      competitor
    ),
    results,
    highlights,
    chartConfigs: [
      {
        key: "yield",
        title: m.results.charts.yield.title,
        formatValue: (v) =>
          `${v.toLocaleString(m.numberLocale)} MWh`,
      },
      {
        key: "cost",
        title: m.results.charts.cost.title(sym),
        formatValue: (v) =>
          `${sym}${v.toLocaleString(m.numberLocale, { maximumFractionDigits: 0 })}`,
      },
      {
        key: "payback",
        title: m.results.charts.payback.title,
        formatValue: (v) =>
          m.results.charts.payback.formatBar(
            formatPaybackYears(v, basicParams.operationYears)
          ),
      },
    ],
    disclaimer: reportLabels.disclaimer,
    watermark: reportLabels.watermark,
    attribution: reportLabels.attribution,
    feedback: reportLabels.feedback,
    legalNotice: reportLabels.combinedFooter,
    locale,
  };
}

/** Safe filename segment for PDF download */
export function reportPdfFilename(
  projectName: string,
  locale: AppLocale = "zh",
  date = new Date()
): string {
  const m = getMessages(locale);
  const base = (projectName.trim() || m.common.unnamedProject)
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
    .slice(0, 80);
  const d = date.toISOString().slice(0, 10);
  return `LONGi-PV_${base}_${d}.pdf`;
}
