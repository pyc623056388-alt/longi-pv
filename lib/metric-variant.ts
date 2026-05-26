export type MetricHighlightVariant = "positive" | "negative" | "neutral";

export function highlightVariant(
  value: number,
  higherIsBetter = true
): MetricHighlightVariant {
  if (value === 0) return "neutral";
  const good = higherIsBetter ? value > 0 : value < 0;
  return good ? "positive" : "negative";
}
