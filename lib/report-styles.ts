/** Hex-only styles for PDF export (html2canvas cannot parse oklch/lab). */

export const reportColors = {
  brand: "#E40011",
  positive: "#00C07F",
  negative: "#E11D48",
  positiveBg: "#ecfdf5",
  negativeBg: "#fff1f2",
  text: "#0f172a",
  textMuted: "#64748b",
  textLight: "#94a3b8",
  border: "#e2e8f0",
  borderLight: "#f1f5f9",
  bg: "#ffffff",
  bgMuted: "#f8fafc",
  longiBar: "#E40011",
  compBar: "#cbd5e1",
} as const;

export type ReportHighlightVariant = "positive" | "negative" | "neutral";

export function reportVariantColor(
  variant: ReportHighlightVariant | undefined
): string {
  if (variant === "positive") return reportColors.positive;
  if (variant === "negative") return reportColors.negative;
  return reportColors.textMuted;
}

export function reportVariantBg(
  variant: ReportHighlightVariant | undefined
): string | undefined {
  if (variant === "positive") return reportColors.positiveBg;
  if (variant === "negative") return reportColors.negativeBg;
  return undefined;
}

export const reportFont =
  "system-ui, -apple-system, 'Segoe UI', sans-serif";
