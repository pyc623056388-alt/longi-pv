/** PV string Voc calculator: general method + IEC 62548-1:2023 Clause F.1.1.b */

export const T_STC_C = 25;
export const IEC_CELL_OFFSET_K = 10;
/** Datasheet −0.20 %/°C stored as a fractional coefficient. */
export const DEFAULT_ALPHA_VOC_PER_C = -0.002;
export const DEFAULT_VOLTAGE_LIMIT_V = 1500;

export interface StringModuleInput {
  id: string;
  model: string;
  powerWp: number;
  vocStc: number;
  /** Fractional Voc temperature coefficient per °C, e.g. −0.002 for −0.20 %/°C */
  alphaVocPerC: number;
  modulesPerString: number;
}

export interface StringCalcParams {
  tEamdbtC: number;
  voltageLimitV: number;
  tStcC?: number;
  iecCellOffsetK?: number;
}

export interface MethodBreakdown {
  tUsedC: number;
  vocModuleV: number;
  stringVocV: number;
  stringVocRoundedV: number;
  maxModules: number;
  withinLimit: boolean;
  marginV: number;
  ku?: number;
  betaVPerC?: number;
  uOcArrayV?: number;
}

export interface ModuleStringResult {
  module: StringModuleInput;
  general: MethodBreakdown;
  iec: MethodBreakdown;
}

export interface StringCalcResult {
  params: Required<StringCalcParams>;
  rows: ModuleStringResult[];
}

export function alphaFromPercentPerC(percentPerC: number): number {
  return percentPerC / 100;
}

export function percentPerCFromAlpha(alphaVocPerC: number): number {
  return alphaVocPerC * 100;
}

export function alphaVocFromModule(vocTempCoefPct?: number): number {
  if (vocTempCoefPct != null && Number.isFinite(vocTempCoefPct)) {
    return alphaFromPercentPerC(vocTempCoefPct);
  }
  return DEFAULT_ALPHA_VOC_PER_C;
}

export function formatAlphaPctDisplay(vocTempCoefPct?: number): string {
  const pct = vocTempCoefPct ?? percentPerCFromAlpha(DEFAULT_ALPHA_VOC_PER_C);
  return pct.toFixed(Math.abs(pct) >= 0.1 ? 2 : 3);
}

export function vocAtTemperature(
  vocStc: number,
  alphaVocPerC: number,
  tC: number,
  tStcC = T_STC_C
): number {
  return vocStc * (1 + alphaVocPerC * (tC - tStcC));
}

export function iecCorrectionFactor(
  vocStc: number,
  alphaVocPerC: number,
  tCellC: number,
  tStcC = T_STC_C
): { betaVPerC: number; ku: number } {
  const betaVPerC = alphaVocPerC * vocStc;
  const ku = 1 + (betaVPerC * (tCellC - tStcC)) / vocStc;
  return { betaVPerC, ku };
}

function maxModulesForLimit(stringVocAtOneModule: number, voltageLimitV: number): number {
  if (!(stringVocAtOneModule > 0) || !(voltageLimitV > 0)) return 0;
  return Math.max(0, Math.floor(voltageLimitV / stringVocAtOneModule));
}

function breakdown(
  vocModuleV: number,
  modulesPerString: number,
  voltageLimitV: number,
  extra: Partial<MethodBreakdown> & { tUsedC: number }
): MethodBreakdown {
  const stringVocV = vocModuleV * modulesPerString;
  const marginV = voltageLimitV - stringVocV;
  return {
    vocModuleV,
    stringVocV,
    stringVocRoundedV: Math.round(stringVocV),
    maxModules: maxModulesForLimit(vocModuleV, voltageLimitV),
    withinLimit: stringVocV <= voltageLimitV + 1e-9,
    marginV,
    ...extra,
  };
}

export function calculateModuleString(
  module: StringModuleInput,
  params: StringCalcParams
): ModuleStringResult {
  const tStcC = params.tStcC ?? T_STC_C;
  const iecCellOffsetK = params.iecCellOffsetK ?? IEC_CELL_OFFSET_K;
  const tEamdbtC = params.tEamdbtC;
  const voltageLimitV = params.voltageLimitV;

  const vocGeneral = vocAtTemperature(
    module.vocStc,
    module.alphaVocPerC,
    tEamdbtC,
    tStcC
  );
  const general = breakdown(vocGeneral, module.modulesPerString, voltageLimitV, {
    tUsedC: tEamdbtC,
  });

  const tCellC = tEamdbtC + iecCellOffsetK;
  const { betaVPerC, ku } = iecCorrectionFactor(
    module.vocStc,
    module.alphaVocPerC,
    tCellC,
    tStcC
  );
  const uOcArrayV = module.vocStc * module.modulesPerString;
  const vocIecModule = ku * module.vocStc;
  const iec = breakdown(vocIecModule, module.modulesPerString, voltageLimitV, {
    tUsedC: tCellC,
    ku,
    betaVPerC,
    uOcArrayV,
  });

  return { module, general, iec };
}

export function calculateStringVoltage(
  modules: StringModuleInput[],
  params: StringCalcParams
): StringCalcResult {
  const resolved: Required<StringCalcParams> = {
    tEamdbtC: params.tEamdbtC,
    voltageLimitV: params.voltageLimitV,
    tStcC: params.tStcC ?? T_STC_C,
    iecCellOffsetK: params.iecCellOffsetK ?? IEC_CELL_OFFSET_K,
  };
  return {
    params: resolved,
    rows: modules.map((m) => calculateModuleString(m, resolved)),
  };
}

export function formatVocV(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(digits)} V`;
}

export function newCustomModuleId(): string {
  return `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
