import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import {
  metricHigherIsBetter,
  metricHigherIsBetterById,
  type ResultMetricId,
} from "../lib/i18n";

import {
  highlightVariant,
  type MetricHighlightVariant,
} from "../lib/metric-variant";

export type { MetricHighlightVariant };
export { highlightVariant };

interface MetricHighlightProps {
  value: string;
  unit?: string;
  caption: string;
  variant?: MetricHighlightVariant;
}

const valueColor: Record<MetricHighlightVariant, string> = {
  positive: "text-[#00C07F]",
  negative: "text-rose-500",
  neutral: "text-slate-500",
};

export function MetricHighlight({
  value,
  unit,
  caption,
  variant = "positive",
}: MetricHighlightProps) {
  const color = valueColor[variant];

  return (
    <div className="text-center mt-4 pt-4 border-t border-slate-100">
      <div className={`tabular-nums ${color}`}>
        <span className="text-4xl md:text-5xl font-black">{value}</span>
        {unit ? (
          <span className="text-xl md:text-2xl font-bold ml-0.5 align-top">
            {unit}
          </span>
        ) : null}
      </div>
      <p className="text-sm text-slate-500 mt-2 leading-snug">{caption}</p>
    </div>
  );
}

export function formatSignedPct(pct: number, digits = 2): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(digits)}`;
}

export function formatPctMagnitude(pct: number, digits = 2): string {
  return Math.abs(pct).toFixed(digits);
}

export { metricHigherIsBetter, metricHigherIsBetterById } from "../lib/i18n";

/** 解析比对量字符串为数值（无法解析返回 null） */
export function parseDeltaValue(delta: string): number | null {
  const trimmed = delta.trim();
  if (!trimmed || trimmed === "—") return null;
  const cleaned = trimmed.replace(/%/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

const NEUTRAL_EPSILON = 0.005;

export function comparisonDeltaVariant(
  delta: string,
  metric: string,
  metricId?: ResultMetricId
): MetricHighlightVariant {
  const value = parseDeltaValue(delta);
  if (value === null) return "neutral";
  if (Math.abs(value) < NEUTRAL_EPSILON) return "neutral";
  const higherIsBetter = metricId
    ? metricHigherIsBetterById(metricId)
    : metricHigherIsBetter(metric);
  return highlightVariant(value, higherIsBetter);
}

function deltaDirectionIcon(delta: string): typeof TrendingUp {
  const value = parseDeltaValue(delta);
  if (value === null || Math.abs(value) < NEUTRAL_EPSILON) return Minus;
  return value > 0 ? TrendingUp : TrendingDown;
}

const badgeContainerStyles: Record<MetricHighlightVariant, string> = {
  positive: "bg-emerald-50 text-[#00C07F] ring-1 ring-emerald-200/70",
  negative: "bg-rose-50 text-rose-600 ring-1 ring-rose-200/70",
  neutral: "bg-slate-100 text-slate-500 ring-1 ring-slate-200/60",
};

interface ComparisonDeltaBadgeProps {
  delta: string;
  metric: string;
  metricId?: ResultMetricId;
  className?: string;
}

export function ComparisonDeltaBadge({
  delta,
  metric,
  metricId,
  className,
}: ComparisonDeltaBadgeProps) {
  const variant = comparisonDeltaVariant(delta, metric, metricId);
  const container = badgeContainerStyles[variant];
  const Icon = deltaDirectionIcon(delta);

  return (
    <span
      className={[
        "inline-flex items-center justify-end gap-1 rounded-full px-2.5 py-1 text-sm font-semibold tabular-nums",
        container,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
      {delta}
    </span>
  );
}
