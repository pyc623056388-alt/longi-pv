import type { ModuleLibrary, ModuleRecord } from "./pv-types";

/** 隆基 BC 组件 Pmp 温度系数下限（绝对值不超过 0.26，即不低于 -0.26） */
export const LONGI_BC_PMP_TEMP_COEF_FLOOR = -0.26;

export const LONGI_LIBRARY_DEFAULTS = {
  pricePerW: 0.25,
  firstYearDegradationPct: 0.8,
  annualDegradationPct: 0.35,
  pmpTempCoef: LONGI_BC_PMP_TEMP_COEF_FLOOR,
} as const;

export const COMPETITOR_LIBRARY_DEFAULTS = {
  pricePerW: 0.23,
  firstYearDegradationPct: 1,
  annualDegradationPct: 0.4,
  pmpTempCoef: -0.29,
} as const;

export type LibraryDefaultValues = {
  pricePerW: number;
  firstYearDegradationPct: number;
  annualDegradationPct: number;
  pmpTempCoef: number;
};

export function libraryDefaults(library: ModuleLibrary): LibraryDefaultValues {
  return library === "longi" ? LONGI_LIBRARY_DEFAULTS : COMPETITOR_LIBRARY_DEFAULTS;
}

/** 将 PAN 等来源中更负于 -0.26 的隆基温度系数收束到 -0.26 */
export function clampLongiPmpTempCoef(
  value: number | undefined
): number | undefined {
  if (value === undefined || !Number.isFinite(value)) return value;
  if (value < LONGI_BC_PMP_TEMP_COEF_FLOOR) return LONGI_BC_PMP_TEMP_COEF_FLOOR;
  return value;
}

/** Fill missing commercial/electrical fields from library defaults; never overwrite existing values. */
export function enrichModuleRecord(record: ModuleRecord): ModuleRecord {
  const d = libraryDefaults(record.library);
  const rawCoef = record.pmpTempCoef ?? d.pmpTempCoef;
  const pmpTempCoef =
    record.library === "longi"
      ? clampLongiPmpTempCoef(rawCoef) ?? d.pmpTempCoef
      : rawCoef;
  return {
    ...record,
    pricePerW: record.pricePerW ?? d.pricePerW,
    firstYearDegradationPct:
      record.firstYearDegradationPct ?? d.firstYearDegradationPct,
    annualDegradationPct:
      record.annualDegradationPct ?? d.annualDegradationPct,
    pmpTempCoef,
  };
}

export function libraryDefaultSpecStrings(library: ModuleLibrary): {
  tempCoef: string;
  firstYearDeg: string;
  annualDeg: string;
  price: string;
} {
  const d = libraryDefaults(library);
  return {
    tempCoef: String(d.pmpTempCoef),
    firstYearDeg: String(d.firstYearDegradationPct),
    annualDeg: String(d.annualDegradationPct),
    price: String(d.pricePerW),
  };
}
