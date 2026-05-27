import type { CurrencyCode } from "./pv-types";

/** 各币种 PPA 常见区间（用于输入提示，非硬性校验） */
export const PPA_REFERENCE_RANGES: Record<
  CurrencyCode,
  { min: number; max: number; label: string }
> = {
  USD: { min: 0.05, max: 0.15, label: "美元分布式常见约 0.05～0.15" },
  AUD: { min: 0.05, max: 0.15, label: "澳元分布式常见约 0.05～0.15" },
  NZD: { min: 0.05, max: 0.15, label: "新西兰元常见约 0.05～0.15" },
  CNY: { min: 0.25, max: 0.45, label: "人民币常见约 0.25～0.45" },
};

export function isPpaOutsideReference(
  ppa: number,
  currency: CurrencyCode
): boolean {
  const range = PPA_REFERENCE_RANGES[currency];
  return ppa > 0 && (ppa < range.min * 0.5 || ppa > range.max * 1.5);
}

/** 由除组件外单价（货币/Wp）反推每块除组件外其他费用 */
export function suggestAccessoryPerModule(
  otherCostPerWp: number,
  powerWp: number
): number {
  if (!Number.isFinite(otherCostPerWp) || powerWp <= 0) {
    return 0;
  }
  return Math.max(0, otherCostPerWp * powerWp);
}

export function staticPaybackYears(
  projectCost: number,
  firstYearRevenue: number
): number {
  if (projectCost <= 0) return 0;
  if (firstYearRevenue <= 0) return Infinity;
  return projectCost / firstYearRevenue;
}
