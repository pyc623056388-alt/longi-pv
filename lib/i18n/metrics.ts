import type { ResultMetricId } from "@/lib/i18n/types";

/** Whether a higher value in the delta column favours LONGi */
export function metricHigherIsBetterById(id: ResultMetricId): boolean {
  switch (id) {
    case "moduleCost":
    case "accessoryCost":
    case "projectCost":
    case "staticPayback":
    case "dynamicPayback":
    case "moduleCount":
      return false;
    default:
      return true;
  }
}

/** @deprecated Prefer metricId; kept for tests and legacy metric strings */
export function metricHigherIsBetter(metric: string): boolean {
  if (
    metric.includes("成本") ||
    metric.includes("Cost") ||
    metric.includes("回收期") ||
    metric.includes("payback") ||
    metric.includes("Payback") ||
    metric.includes("组件块数") ||
    metric.includes("Module count")
  ) {
    return false;
  }
  return true;
}
