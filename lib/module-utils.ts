import type { ModuleSpec } from "./pv-calculation";
import type { ModuleRecord } from "./pv-types";

export type ModuleSpecField = keyof Pick<
  ModuleSpec,
  "power" | "tempCoef" | "firstYearDeg" | "annualDeg" | "price" | "dimensions"
>;

export const DEFAULT_SPEC_VALUES = {
  tempCoef: "-0.29",
  firstYearDeg: "1",
  annualDeg: "0.4",
  price: "0.9",
} as const;

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
  return {
    power: String(record.powerWp),
    tempCoef: optionalNumString(record.pmpTempCoef),
    firstYearDeg: optionalNumString(record.firstYearDegradationPct),
    annualDeg: optionalNumString(record.annualDegradationPct),
    price: optionalNumString(record.pricePerW),
    dimensions: formatModuleDimensions(record),
    name: `${record.manufacturer} ${record.model}`.trim(),
  };
}

export function mergeModuleSpec(
  base: ModuleSpec,
  overrides?: Partial<ModuleSpec>
): ModuleSpec {
  if (!overrides) return { ...base };
  return { ...base, ...overrides };
}

/** 计算用：缺失字段填入行业默认值 */
export function moduleSpecForCalculation(spec: ModuleSpec): ModuleSpec {
  return {
    ...spec,
    power: spec.power || "590",
    tempCoef: spec.tempCoef || DEFAULT_SPEC_VALUES.tempCoef,
    firstYearDeg: spec.firstYearDeg || DEFAULT_SPEC_VALUES.firstYearDeg,
    annualDeg: spec.annualDeg || DEFAULT_SPEC_VALUES.annualDeg,
    price: spec.price || DEFAULT_SPEC_VALUES.price,
  };
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
      return `${currencySymbol ?? ""}${value}/W`;
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
