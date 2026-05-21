export type CurrencyCode = "USD" | "AUD" | "NZD" | "CNY";

export type ModuleLibrary = "longi" | "competitor";

export interface ModuleRecord {
  id: string;
  manufacturer: string;
  model: string;
  powerWp: number;
  lengthMm?: number;
  widthMm?: number;
  pmpTempCoef?: number;
  firstYearDegradationPct?: number;
  annualDegradationPct?: number;
  pricePerW?: number;
  library: ModuleLibrary;
  source?: "pan" | "xlsx" | "csv" | "manual";
}

export interface WeatherRecord {
  id: string;
  name: string;
  location?: string;
  lat?: number;
  lon?: number;
  monthlyIrradianceKwhM2Day?: number[];
  yearlyEquivalentHours?: number;
  source?: "epw" | "manual";
}

export interface BasicParams {
  tiltDeg: number;
  yearlyEquivalentHours: number;
  accessoryCostPerModule: number;
  operationYears: number;
  ppaPrice: number;
  currency: CurrencyCode;
}

export const DEFAULT_BASIC_PARAMS: BasicParams = {
  tiltDeg: 10,
  yearlyEquivalentHours: 1500,
  accessoryCostPerModule: 0.3,
  operationYears: 30,
  ppaPrice: 0.15,
  currency: "AUD",
};

export type GainRuleId = "standard";

export interface GainStrategies {
  temperature: { enabled: boolean; ruleId: GainRuleId };
  antiShading: { enabled: boolean; ruleId: GainRuleId };
  lowLight: { enabled: boolean; ruleId: GainRuleId };
}

export const DEFAULT_GAIN_STRATEGIES: GainStrategies = {
  temperature: { enabled: true, ruleId: "standard" },
  antiShading: { enabled: true, ruleId: "standard" },
  lowLight: { enabled: true, ruleId: "standard" },
};

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  USD: "美元 USD",
  AUD: "澳元 AUD",
  NZD: "新西兰元 NZD",
  CNY: "人民币 CNY",
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: "$",
  AUD: "A$",
  NZD: "NZ$",
  CNY: "¥",
};
