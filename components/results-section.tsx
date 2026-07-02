"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { toast } from "sonner";
import {
  Download,
  Loader2,
  RotateCcw,
  Settings,
  Zap,
  Wallet,
  Package,
  TrendingUp,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { exportPdfErrorMessage, exportReportPdf } from "@/lib/export-pdf";
import type { ReportSnapshot } from "@/lib/report-snapshot";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { GainStrategyPanel } from "@/components/gain-strategy-panel";
import { useI18n } from "@/components/locale-provider";
import {
  ComparisonDeltaBadge,
  MetricHighlight,
  highlightVariant,
  formatSignedPct,
  formatPctMagnitude,
} from "@/components/metric-highlight";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ResultMetricId } from "@/lib/i18n/types";
import {
  RESULT_METRIC_IDS,
  applyResultsDisplaySettings,
  canToggleMetricOff,
  DEFAULT_RESULTS_DISPLAY_SETTINGS,
  loadResultsDisplaySettings,
  saveResultsDisplaySettings,
  type MiddleChartMode,
  type ResultsDisplaySettings,
} from "@/lib/results-display-settings";
import {
  formatPaybackYears,
  type ModuleSpec,
  type PvComparisonResult,
} from "@/lib/pv-calculation";
import type { GainStrategies } from "@/lib/pv-types";
import { CURRENCY_SYMBOLS, type CurrencyCode } from "@/lib/pv-types";

interface ResultsSectionProps {
  results: PvComparisonResult;
  gainStrategies: GainStrategies;
  onGainStrategiesChange: (s: GainStrategies) => void;
  longi: ModuleSpec;
  competitor: ModuleSpec;
  currency: CurrencyCode;
  operationYears: number;
  getReportSnapshot: () => ReportSnapshot;
  onReset: () => void;
}

type ChartKey = "yield" | "cost" | "accessory" | "netProfit" | "payback";

interface ChartCardConfig {
  title: string;
  hint: string;
  key: ChartKey;
  icon: LucideIcon;
  formatBar: (v: number) => string;
  highlight: {
    value: string;
    unit?: string;
    caption: string;
    variant: "positive" | "negative" | "neutral";
  };
  tooltipDelta: string;
}

function renderChartTooltip(
  active: boolean | undefined,
  payload: unknown,
  label: unknown,
  formatValue: (v: number) => string,
  deltaLabel: string
) {
  if (!active || !Array.isArray(payload) || payload.length === 0) return null;
  const entry = payload[0] as { value?: number | string };
  const raw = entry.value;
  const value = typeof raw === "number" ? raw : Number(raw) || 0;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-slate-900">{String(label ?? "")}</p>
      <p className="text-slate-700 mt-0.5">{formatValue(value)}</p>
      <p className="text-slate-500 mt-1">{deltaLabel}</p>
    </div>
  );
}

export function ResultsSection({
  results,
  gainStrategies,
  onGainStrategiesChange,
  longi,
  competitor,
  currency,
  operationYears,
  getReportSnapshot,
  onReset,
}: ResultsSectionProps) {
  const { m, formatNumber } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [displaySettings, setDisplaySettings] =
    useState<ResultsDisplaySettings>(DEFAULT_RESULTS_DISPLAY_SETTINGS);

  useEffect(() => {
    setDisplaySettings(loadResultsDisplaySettings());
  }, []);

  const persistDisplaySettings = useCallback(
    (next: ResultsDisplaySettings) => {
      setDisplaySettings(next);
      saveResultsDisplaySettings(next);
    },
    []
  );

  const handleMetricVisibilityChange = useCallback(
    (metricId: ResultMetricId, checked: boolean) => {
      if (!checked && !canToggleMetricOff(displaySettings, metricId)) {
        toast.warning(m.results.displaySettings.keepOneRow);
        return;
      }
      persistDisplaySettings({
        ...displaySettings,
        visibleMetrics: {
          ...displaySettings.visibleMetrics,
          [metricId]: checked,
        },
      });
    },
    [displaySettings, m.results.displaySettings.keepOneRow, persistDisplaySettings]
  );

  const handleMiddleChartModeChange = useCallback(
    (mode: MiddleChartMode) => {
      persistDisplaySettings({
        ...displaySettings,
        middleChartMode: mode,
      });
    },
    [displaySettings, persistDisplaySettings]
  );

  const handleExportPdf = useCallback(async () => {
    if (exporting) return;
    const snapshot = applyResultsDisplaySettings(
      getReportSnapshot(),
      displaySettings
    );
    if (snapshot.usedDefaultProjectName) {
      toast.warning(m.results.emptyProjectNameWarning);
    }
    setExporting(true);
    try {
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      await exportReportPdf(snapshot);
      toast.success(m.results.pdfSuccess);
    } catch (err) {
      console.error("[export-pdf]", err);
      toast.error(m.results.pdfFail(exportPdfErrorMessage(err)));
    } finally {
      setExporting(false);
    }
  }, [exporting, getReportSnapshot, displaySettings, m.results]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  const sym = CURRENCY_SYMBOLS[currency];
  const chartData = results.chartData;

  const yieldVariant = highlightVariant(results.yieldGainPct, true);
  const costVariant = highlightVariant(results.costReductionPct, true);
  const accessoryVariant = highlightVariant(
    results.accessoryReductionPct,
    true
  );
  const netProfitVariant = highlightVariant(results.netProfitGainPct, true);
  const paybackVariant = highlightVariant(results.paybackReductionYears, true);

  const middleChartMode = displaySettings.middleChartMode;

  const chartCards: ChartCardConfig[] = useMemo(() => {
    const yieldCard: ChartCardConfig = {
      title: m.results.charts.yield.title,
      hint: m.results.charts.yield.hint,
      key: "yield",
      icon: Zap,
      formatBar: (v) => `${formatNumber(v)} MWh`,
      highlight: {
        value: formatSignedPct(results.yieldGainPct),
        unit: "%",
        caption:
          results.yieldGainPct >= 0
            ? m.results.charts.yield.captionUp
            : m.results.charts.yield.captionDown,
        variant: yieldVariant,
      },
      tooltipDelta: m.results.charts.yield.tooltipDelta(
        formatSignedPct(results.yieldGainPct)
      ),
    };

    const middleCard: ChartCardConfig = (() => {
      if (middleChartMode === "accessoryCost") {
        return {
          title: m.results.charts.accessory.title(sym),
          hint: m.results.charts.accessory.hint,
          key: "accessory",
          icon: Package,
          formatBar: (v) =>
            `${sym}${formatNumber(v, { maximumFractionDigits: 0 })}`,
          highlight: {
            value: formatPctMagnitude(results.accessoryReductionPct),
            unit: "%",
            caption:
              results.accessoryReductionPct >= 0
                ? m.results.charts.accessory.captionDown
                : m.results.charts.accessory.captionUp,
            variant: accessoryVariant,
          },
          tooltipDelta:
            results.accessoryReductionPct >= 0
              ? m.results.charts.accessory.tooltipDown(
                  formatPctMagnitude(results.accessoryReductionPct)
                )
              : m.results.charts.accessory.tooltipUp(
                  formatPctMagnitude(results.accessoryReductionPct)
                ),
        };
      }
      if (middleChartMode === "netProfit") {
        return {
          title: m.results.charts.netProfit.title(sym),
          hint: m.results.charts.netProfit.hint,
          key: "netProfit",
          icon: TrendingUp,
          formatBar: (v) =>
            `${sym}${formatNumber(v, { maximumFractionDigits: 0 })}`,
          highlight: {
            value: formatSignedPct(results.netProfitGainPct),
            unit: "%",
            caption:
              results.netProfitGainPct >= 0
                ? m.results.charts.netProfit.captionUp
                : m.results.charts.netProfit.captionDown,
            variant: netProfitVariant,
          },
          tooltipDelta: m.results.charts.netProfit.tooltipDelta(
            formatSignedPct(results.netProfitGainPct)
          ),
        };
      }
      return {
        title: m.results.charts.cost.title(sym),
        hint: m.results.charts.cost.hint,
        key: "cost",
        icon: Wallet,
        formatBar: (v) =>
          `${sym}${formatNumber(v, { maximumFractionDigits: 0 })}`,
        highlight: {
          value: formatPctMagnitude(results.costReductionPct),
          unit: "%",
          caption:
            results.costReductionPct >= 0
              ? m.results.charts.cost.captionDown
              : m.results.charts.cost.captionUp,
          variant: costVariant,
        },
        tooltipDelta:
          results.costReductionPct >= 0
            ? m.results.charts.cost.tooltipDown(
                formatPctMagnitude(results.costReductionPct)
              )
            : m.results.charts.cost.tooltipUp(
                formatPctMagnitude(results.costReductionPct)
              ),
      };
    })();

    const paybackCard: ChartCardConfig = {
      title: m.results.charts.payback.title,
      hint: m.results.charts.payback.hint,
      key: "payback",
      icon: Clock,
      formatBar: (v) =>
        m.results.charts.payback.formatBar(
          formatPaybackYears(v, operationYears)
        ),
      highlight: {
        value: Math.abs(results.paybackReductionYears).toFixed(2),
        unit: m.common.yearUnit,
        caption:
          results.paybackReductionYears >= 0
            ? m.results.charts.payback.captionShorter
            : m.results.charts.payback.captionLonger,
        variant: paybackVariant,
      },
      tooltipDelta:
        results.paybackReductionYears >= 0
          ? m.results.charts.payback.tooltipShorter(
              Math.abs(results.paybackReductionYears).toFixed(2)
            )
          : m.results.charts.payback.tooltipLonger(
              Math.abs(results.paybackReductionYears).toFixed(2)
            ),
    };

    return [yieldCard, middleCard, paybackCard];
  }, [
    m,
    sym,
    results,
    middleChartMode,
    yieldVariant,
    costVariant,
    accessoryVariant,
    netProfitVariant,
    paybackVariant,
    operationYears,
    formatNumber,
  ]);

  const visibleRows = useMemo(
    () =>
      results.rows.filter(
        (row) => displaySettings.visibleMetrics[row.metricId]
      ),
    [results.rows, displaySettings.visibleMetrics]
  );

  return (
    <motion.section
      ref={ref}
      style={{ opacity }}
      className="min-h-screen py-32 bg-gradient-to-b from-white to-slate-50"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-12">
          <div className="flex items-start justify-between gap-4">
            <div className="text-center flex-1 min-w-0">
              <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold mb-4">
                {m.results.stepBadge}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                {m.results.title}
              </h2>
              <p className="text-slate-500">{m.results.subtitle(currency)}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="shrink-0 mt-2 p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 shadow-sm"
                  aria-label={m.results.displaySettings.menuAria}
                >
                  <Settings className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  {m.results.displaySettings.sectionTable}
                </DropdownMenuLabel>
                {RESULT_METRIC_IDS.map((id) => (
                  <DropdownMenuCheckboxItem
                    key={id}
                    checked={displaySettings.visibleMetrics[id]}
                    disabled={
                      displaySettings.visibleMetrics[id] &&
                      !canToggleMetricOff(displaySettings, id)
                    }
                    onCheckedChange={(checked) =>
                      handleMetricVisibilityChange(id, checked === true)
                    }
                  >
                    {m.resultMetrics[id]}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>
                  {m.results.displaySettings.sectionChart}
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={displaySettings.middleChartMode}
                  onValueChange={(v) =>
                    handleMiddleChartModeChange(v as MiddleChartMode)
                  }
                >
                  <DropdownMenuRadioItem value="projectCost">
                    {m.results.displaySettings.middleChartProjectCost}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="accessoryCost">
                    {m.results.displaySettings.middleChartAccessory}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="netProfit">
                    {m.results.displaySettings.middleChartNetProfit}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <GainStrategyPanel
          strategies={gainStrategies}
          onChange={onGainStrategiesChange}
          longi={longi}
          competitor={competitor}
        />

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {chartCards.map((chart) => {
            const Icon = chart.icon;
            return (
              <div
                key={chart.key}
                className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 flex flex-col"
              >
                <div className="flex items-start gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E40011] to-[#ff4d5a] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {chart.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{chart.hint}</p>
                  </div>
                </div>
                <div className="h-40 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      barSize={24}
                      margin={{ right: 36 }}
                    >
                      <XAxis
                        type="number"
                        domain={[0, "auto"]}
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={48}
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={({ active, payload, label }) =>
                          renderChartTooltip(
                            active,
                            payload,
                            label,
                            chart.formatBar,
                            chart.tooltipDelta
                          )
                        }
                      />
                      <Bar dataKey={chart.key} radius={12}>
                        <Cell fill="#E40011" />
                        <Cell fill="#cbd5e1" />
                        <LabelList
                          dataKey={chart.key}
                          position="right"
                          formatter={(v: number) =>
                            chart.key === "yield"
                              ? String(v)
                              : chart.key === "payback"
                                ? v.toFixed(2)
                                : formatNumber(v, { maximumFractionDigits: 0 })
                          }
                          className="fill-slate-600 text-[10px]"
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <MetricHighlight
                  value={chart.highlight.value}
                  unit={chart.highlight.unit}
                  caption={chart.highlight.caption}
                  variant={chart.highlight.variant}
                />
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden mb-12">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{m.results.tableMetric}</TableHead>
                <TableHead>{results.longiLabel}</TableHead>
                <TableHead>{results.compLabel}</TableHead>
                <TableHead className="text-right">{m.results.tableDelta}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.map((row) => (
                <TableRow key={row.metricId}>
                  <TableCell className="font-medium">{row.metric}</TableCell>
                  <TableCell>{row.longi}</TableCell>
                  <TableCell>{row.competitor}</TableCell>
                  <TableCell className="text-right">
                    <ComparisonDeltaBadge
                      delta={row.delta}
                      metric={row.metric}
                      metricId={row.metricId}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => void handleExportPdf()}
            disabled={exporting}
            className="px-8 py-4 font-semibold bg-gradient-to-r from-[#E40011] to-[#ff4d5a] text-white rounded-2xl shadow-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
          >
            {exporting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            {exporting ? m.results.exportingPdf : m.results.exportPdf}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="px-8 py-4 font-semibold bg-white text-[#E40011] rounded-2xl shadow-lg flex items-center gap-2 border border-[#E40011]/30"
          >
            <RotateCcw className="w-5 h-5" />
            {m.results.reset}
          </button>
        </div>
      </div>
    </motion.section>
  );
}
