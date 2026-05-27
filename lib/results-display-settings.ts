import type { ResultMetricId } from "./i18n/types";
import { getMessages } from "./i18n";
import { highlightVariant } from "./metric-variant";
import type { ReportSnapshot } from "./report-snapshot";
import { CURRENCY_SYMBOLS } from "./pv-types";

export type MiddleChartMode = "projectCost" | "accessoryCost" | "netProfit";

export type ResultsDisplaySettings = {
  visibleMetrics: Record<ResultMetricId, boolean>;
  middleChartMode: MiddleChartMode;
};

export const RESULT_METRIC_IDS: ResultMetricId[] = [
  "moduleCount",
  "capacity",
  "firstYearYield",
  "lifetimeYield",
  "firstYearRevenue",
  "lifetimeRevenue",
  "moduleCost",
  "accessoryCost",
  "projectCost",
  "netProfit",
  "staticPayback",
  "dynamicPayback",
];

const STORAGE_KEY = "longi-pv:results-display-v1";

export const DEFAULT_RESULTS_DISPLAY_SETTINGS: ResultsDisplaySettings = {
  visibleMetrics: Object.fromEntries(
    RESULT_METRIC_IDS.map((id) => [id, true])
  ) as Record<ResultMetricId, boolean>,
  middleChartMode: "projectCost",
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isMiddleChartMode(v: unknown): v is MiddleChartMode {
  return (
    v === "projectCost" || v === "accessoryCost" || v === "netProfit"
  );
}

function formatSignedPct(pct: number, digits = 2): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(digits)}`;
}

export function normalizeResultsDisplaySettings(
  raw: Partial<ResultsDisplaySettings> | null | undefined
): ResultsDisplaySettings {
  const base = { ...DEFAULT_RESULTS_DISPLAY_SETTINGS };
  if (!raw || typeof raw !== "object") return base;

  const visibleMetrics = { ...base.visibleMetrics };
  if (raw.visibleMetrics && typeof raw.visibleMetrics === "object") {
    for (const id of RESULT_METRIC_IDS) {
      const v = raw.visibleMetrics[id];
      if (typeof v === "boolean") visibleMetrics[id] = v;
    }
  }

  const visibleCount = RESULT_METRIC_IDS.filter((id) => visibleMetrics[id]).length;
  if (visibleCount === 0) {
    return DEFAULT_RESULTS_DISPLAY_SETTINGS;
  }

  return {
    visibleMetrics,
    middleChartMode: isMiddleChartMode(raw.middleChartMode)
      ? raw.middleChartMode
      : base.middleChartMode,
  };
}

export function loadResultsDisplaySettings(): ResultsDisplaySettings {
  if (!isBrowser()) return DEFAULT_RESULTS_DISPLAY_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_RESULTS_DISPLAY_SETTINGS;
    return normalizeResultsDisplaySettings(
      JSON.parse(raw) as Partial<ResultsDisplaySettings>
    );
  } catch {
    return DEFAULT_RESULTS_DISPLAY_SETTINGS;
  }
}

export function saveResultsDisplaySettings(
  settings: ResultsDisplaySettings
): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore quota / private mode */
  }
}

export function countVisibleMetrics(settings: ResultsDisplaySettings): number {
  return RESULT_METRIC_IDS.filter((id) => settings.visibleMetrics[id]).length;
}

export function canToggleMetricOff(
  settings: ResultsDisplaySettings,
  metricId: ResultMetricId
): boolean {
  if (!settings.visibleMetrics[metricId]) return true;
  return countVisibleMetrics(settings) > 1;
}

function formatPctMagnitude(pct: number, digits = 2): string {
  return Math.abs(pct).toFixed(digits);
}

/** Apply table visibility and middle-chart mode to a report snapshot for PDF export. */
export function applyResultsDisplaySettings(
  snapshot: ReportSnapshot,
  settings: ResultsDisplaySettings
): ReportSnapshot {
  const normalized = normalizeResultsDisplaySettings(settings);
  const m = getMessages(snapshot.locale);
  const sym = CURRENCY_SYMBOLS[snapshot.currencyCode];
  const { results } = snapshot;

  const filteredRows = results.rows.filter(
    (row) => normalized.visibleMetrics[row.metricId]
  );

  const highlights = [...snapshot.highlights];
  const chartConfigs = [...snapshot.chartConfigs];

  if (normalized.middleChartMode === "accessoryCost") {
    const pct = results.accessoryReductionPct;
    highlights[1] = {
      title: m.report.highlights.accessoryCost,
      value: formatPctMagnitude(pct),
      unit: "%",
      caption:
        pct >= 0
          ? m.results.charts.accessory.captionDown
          : m.results.charts.accessory.captionUp,
      variant: highlightVariant(pct, true),
    };
    chartConfigs[1] = {
      key: "accessory",
      title: m.results.charts.accessory.title(sym),
      formatValue: (v) =>
        `${sym}${v.toLocaleString(m.numberLocale, { maximumFractionDigits: 0 })}`,
    };
  } else if (normalized.middleChartMode === "netProfit") {
    const pct = results.netProfitGainPct;
    highlights[1] = {
      title: m.report.highlights.netProfit,
      value: formatSignedPct(pct),
      unit: "%",
      caption:
        pct >= 0
          ? m.results.charts.netProfit.captionUp
          : m.results.charts.netProfit.captionDown,
      variant: highlightVariant(pct, true),
    };
    chartConfigs[1] = {
      key: "netProfit",
      title: m.results.charts.netProfit.title(sym),
      formatValue: (v) =>
        `${sym}${v.toLocaleString(m.numberLocale, { maximumFractionDigits: 0 })}`,
    };
  } else {
    const pct = results.costReductionPct;
    highlights[1] = {
      title: m.report.highlights.projectCost,
      value: formatPctMagnitude(pct),
      unit: "%",
      caption:
        pct >= 0
          ? m.results.charts.cost.captionDown
          : m.results.charts.cost.captionUp,
      variant: highlightVariant(pct, true),
    };
    chartConfigs[1] = {
      key: "cost",
      title: m.results.charts.cost.title(sym),
      formatValue: (v) =>
        `${sym}${v.toLocaleString(m.numberLocale, { maximumFractionDigits: 0 })}`,
    };
  }

  return {
    ...snapshot,
    results: { ...results, rows: filteredRows },
    highlights,
    chartConfigs,
  };
}
