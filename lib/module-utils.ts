import {
  enrichModuleRecord,
  libraryDefaultSpecStrings,
} from "./module-library-defaults";
import type { ModuleSpec } from "./pv-calculation";
import type { ModuleLibrary, ModuleRecord } from "./pv-types";

export type ModuleSpecField = keyof Pick<
  ModuleSpec,
  "power" | "tempCoef" | "firstYearDeg" | "annualDeg" | "price" | "dimensions"
>;

/** @deprecated Use libraryDefaultSpecStrings(library) */
export const DEFAULT_SPEC_VALUES = libraryDefaultSpecStrings("competitor");

export function formatModuleDimensions(record: ModuleRecord): string | undefined {
  if (record.lengthMm != null && record.widthMm != null) {
    return `${record.lengthMm}×${record.widthMm} mm`;
  }
  return undefined;
}

function optionalNumString(value: number | undefined): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "";
  return String(value);
}

export function moduleRecordToSpec(record: ModuleRecord): ModuleSpec {
  const enriched = enrichModuleRecord(record);
  return {
    power: String(enriched.powerWp),
    tempCoef: optionalNumString(enriched.pmpTempCoef),
    firstYearDeg: optionalNumString(enriched.firstYearDegradationPct),
    annualDeg: optionalNumString(enriched.annualDegradationPct),
    price: optionalNumString(enriched.pricePerW),
    dimensions: formatModuleDimensions(record),
    name: `${record.manufacturer} ${record.model}`.trim(),
    lowLightRelEffic: record.lowLightRelEffic
      ? { ...record.lowLightRelEffic }
      : undefined,
  };
}

export function mergeModuleSpec(
  base: ModuleSpec,
  overrides?: Partial<ModuleSpec>
): ModuleSpec {
  if (!overrides) return { ...base };
  return { ...base, ...overrides };
}

/** 计算用：缺失字段填入库级默认值（BC / TOPCon 澳洲预设） */
export function moduleSpecForCalculation(
  spec: ModuleSpec,
  library: ModuleLibrary
): ModuleSpec {
  const d = libraryDefaultSpecStrings(library);
  return {
    ...spec,
    power: spec.power || "590",
    tempCoef: spec.tempCoef || d.tempCoef,
    firstYearDeg: spec.firstYearDeg || d.firstYearDeg,
    annualDeg: spec.annualDeg || d.annualDeg,
    price: spec.price || d.price,
  };
}

export type PricePerWParts =
  | { unset: true }
  | { unset?: false; perW: string; perPanel?: string };

/** 单瓦价格拆分展示（perW 主行，perPanel 折合每块副行） */
export function formatPricePerWParts(
  pricePerW: string | undefined,
  powerWp?: string | number,
  currencySymbol?: string
): PricePerWParts {
  if (!pricePerW?.trim()) return { unset: true };
  const sym = currencySymbol ?? "";
  const perW = `${sym}${pricePerW}/W`;
  const pw = typeof powerWp === "number" ? powerWp : parseFloat(powerWp ?? "");
  const price = parseFloat(pricePerW);
  if (Number.isFinite(pw) && pw > 0 && Number.isFinite(price)) {
    return {
      perW,
      perPanel: `≈ ${sym}${(price * pw).toFixed(2)}/块`,
    };
  }
  return { perW };
}

/** 单瓦价格展示，可选折合每块（pricePerW × powerWp） */
export function formatPricePerWDisplay(
  pricePerW: string | undefined,
  powerWp?: string | number,
  currencySymbol?: string
): string {
  const parts = formatPricePerWParts(pricePerW, powerWp, currencySymbol);
  if (parts.unset) return "未设置";
  if (parts.perPanel) {
    return `${parts.perW}（${parts.perPanel}）`;
  }
  return parts.perW;
}

export function formatSpecDisplayValue(
  field: ModuleSpecField,
  value: string | undefined,
  currencySymbol?: string
): string {
  if (!value?.trim()) return "未设置";
  switch (field) {
    case "power":
      return `${value} W`;
    case "tempCoef":
      return `${value} %/°C`;
    case "firstYearDeg":
    case "annualDeg":
      return `${value} %`;
    case "price":
      return formatPricePerWDisplay(value, undefined, currencySymbol);
    case "dimensions":
      return value;
    default:
      return value;
  }
}

export function isSpecFieldUsingDefault(
  field: ModuleSpecField,
  value: string | undefined
): boolean {
  if (value?.trim()) return false;
  return (
    field === "tempCoef" ||
    field === "firstYearDeg" ||
    field === "annualDeg" ||
    field === "price"
  );
}

export function isModuleSpecComplete(spec: ModuleSpec): boolean {
  return !!(
    spec.power?.trim() &&
    spec.tempCoef?.trim() &&
    spec.firstYearDeg?.trim() &&
    spec.annualDeg?.trim()
  );
}

export function moduleRecordNeedsCompletion(record: ModuleRecord): boolean {
  return (
    record.pmpTempCoef == null ||
    record.firstYearDegradationPct == null ||
    record.annualDegradationPct == null
  );
}

export function moduleDisplayName(record: ModuleRecord): string {
  return `${record.manufacturer} ${record.model}`.trim();
}

/** 将对比页单字段值写回 ModuleRecord */
export function applySpecFieldToRecord(
  record: ModuleRecord,
  field: ModuleSpecField,
  value: string
): ModuleRecord {
  const trimmed = value.trim();
  switch (field) {
    case "power":
      return { ...record, powerWp: parseFloat(trimmed) || record.powerWp };
    case "tempCoef":
      return { ...record, pmpTempCoef: parseFloat(trimmed) };
    case "firstYearDeg":
      return { ...record, firstYearDegradationPct: parseFloat(trimmed) };
    case "annualDeg":
      return { ...record, annualDegradationPct: parseFloat(trimmed) };
    case "price":
      return { ...record, pricePerW: parseFloat(trimmed) };
    case "dimensions": {
      const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*[×xX]\s*(\d+(?:\.\d+)?)/);
      if (match) {
        return {
          ...record,
          lengthMm: parseFloat(match[1]),
          widthMm: parseFloat(match[2]),
        };
      }
      return record;
    }
    default:
      return record;
  }
}

export const SPEC_PARAM_LABELS: Record<ModuleSpecField, string> = {
  power: "组件功率",
  dimensions: "尺寸",
  tempCoef: "温度系数",
  firstYearDeg: "首年衰减",
  annualDeg: "年衰减率",
  price: "单瓦价格",
};

export type AdvantageVariant = "positive" | "negative" | "neutral";

const COMPARE_EPSILON = 1e-9;

/** 参数行：null 表示不做优劣着色（如尺寸） */
export function specFieldHigherIsBetter(field: ModuleSpecField): boolean | null {
  switch (field) {
    case "power":
    case "tempCoef":
      return true;
    case "firstYearDeg":
    case "annualDeg":
    case "price":
      return false;
    case "dimensions":
      return null;
    default:
      return null;
  }
}

export { metricHigherIsBetter, metricHigherIsBetterById } from "./i18n/metrics";

export function parseSpecNumeric(
  field: ModuleSpecField,
  raw: string
): number | null {
  const trimmed = raw.trim();
  if (!trimmed || field === "dimensions") return null;
  const n = parseFloat(trimmed);
  return Number.isFinite(n) ? n : null;
}

function compareAdvantage(
  longiValue: number,
  compValue: number,
  higherIsBetter: boolean
): AdvantageVariant {
  if (Math.abs(longiValue - compValue) < COMPARE_EPSILON) return "neutral";
  const longiWins = higherIsBetter
    ? longiValue > compValue
    : longiValue < compValue;
  return longiWins ? "positive" : "negative";
}

/** 组件参数对比：隆基相对竞品是否占优 */
export function longiSpecAdvantageVariant(
  field: ModuleSpecField,
  longiRaw: string,
  compRaw: string
): AdvantageVariant {
  const higher = specFieldHigherIsBetter(field);
  if (higher === null) return "neutral";
  const l = parseSpecNumeric(field, longiRaw);
  const c = parseSpecNumeric(field, compRaw);
  if (l === null || c === null) return "neutral";
  return compareAdvantage(l, c, higher);
}

export function longiSpecValueColorClass(
  variant: AdvantageVariant,
  hasValue: boolean
): string {
  if (!hasValue) return "text-slate-400";
  switch (variant) {
    case "positive":
      return "text-[#00C07F]";
    case "negative":
      return "text-rose-600";
    default:
      return "text-slate-900";
  }
}
