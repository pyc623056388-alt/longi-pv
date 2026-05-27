export type CurrencyCode = "USD" | "AUD" | "NZD" | "CNY";

export type ModuleLibrary = "longi" | "competitor";

export type ModuleSegment =
  | "residential475"
  | "medium60"
  | "large620";

/** IEC 61853 / PVsyst 弱光相对效率测点（W/m²，25°C） */
export const LOW_LIGHT_IRRADIANCE_LEVELS = [200, 400, 600, 800] as const;
export type LowLightIrradianceWm2 = (typeof LOW_LIGHT_IRRADIANCE_LEVELS)[number];
export type LowLightRelEffic = Partial<Record<LowLightIrradianceWm2, number>>;

export interface ModuleRecord {
  id: string;
  manufacturer: string;
  model: string;
  powerWp: number;
  lengthMm?: number;
  widthMm?: number;
  voc?: number;
  isc?: number;
  vmp?: number;
  imp?: number;
  pmpTempCoef?: number;
  firstYearDegradationPct?: number;
  annualDegradationPct?: number;
  /** 相对 STC 的弱光相对效率（%），来自 PAN RelEffic* */
  lowLightRelEffic?: LowLightRelEffic;
  rSerieOhm?: number;
  rShuntOhm?: number;
  pricePerW?: number;
  library: ModuleLibrary;
  source?: "pan" | "pan_synthesized" | "datasheet" | "xlsx" | "csv" | "manual";
  segment?: ModuleSegment;
  /** 为 true 时不在组件库 UI / 下拉中展示，数据仍保留 */
  catalogHidden?: boolean;
}

export interface WeatherRecord {
  id: string;
  name: string;
  /** Locale-specific display; falls back to `name` + heuristic split */
  nameZh?: string;
  nameEn?: string;
  location?: string;
  locationZh?: string;
  locationEn?: string;
  countryCode?: "AUS" | "NZL";
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

export type GainRuleId = "standard" | "conservative" | "pan";

/** 抗遮挡测算场景：户用碎片化遮挡 vs 工商业设计型遮挡 */
export type AntiShadingScenario = "residential" | "commercial";

export interface GainStrategies {
  temperature: { enabled: boolean; ruleId: GainRuleId };
  antiShading: {
    enabled: boolean;
    ruleId: GainRuleId;
    scenario: AntiShadingScenario;
  };
  lowLight: { enabled: boolean; ruleId: GainRuleId };
}

export const DEFAULT_GAIN_STRATEGIES: GainStrategies = {
  temperature: { enabled: true, ruleId: "standard" },
  antiShading: { enabled: true, ruleId: "standard", scenario: "residential" },
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
