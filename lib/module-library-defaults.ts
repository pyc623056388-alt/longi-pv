import type { ModuleLibrary, ModuleRecord } from "./pv-types";

export const LONGI_LIBRARY_DEFAULTS = {
  pricePerW: 0.25,
  firstYearDegradationPct: 0.8,
  annualDegradationPct: 0.35,
  pmpTempCoef: -0.26,
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

/** Fill missing commercial/electrical fields from library defaults; never overwrite existing values. */
export function enrichModuleRecord(record: ModuleRecord): ModuleRecord {
  const d = libraryDefaults(record.library);
  return {
    ...record,
    pricePerW: record.pricePerW ?? d.pricePerW,
    firstYearDegradationPct:
      record.firstYearDegradationPct ?? d.firstYearDegradationPct,
    annualDegradationPct:
      record.annualDegradationPct ?? d.annualDegradationPct,
    pmpTempCoef: record.pmpTempCoef ?? d.pmpTempCoef,
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
