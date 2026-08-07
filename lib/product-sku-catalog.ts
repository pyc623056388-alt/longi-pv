/**
 * Step2：型号（Drive 系列）与功率档分离。
 * 功率档：户用默认 475/480、中版 540、大版 650。
 */

import {
  PRODUCT_MATRIX,
  getProductSeriesById,
  type ProductSeries,
} from "./product-matrix-catalog";

export type ResultPowerBand = "default" | "medium" | "large";

export const RESULT_POWER_BANDS: ResultPowerBand[] = [
  "default",
  "medium",
  "large",
];

/** 各功率档对应的标称功率（default 优先 475，系列不支持时用 480） */
const BAND_POWERS: Record<ResultPowerBand, number[]> = {
  default: [475, 480],
  medium: [540],
  large: [650],
};

export interface ProductSku {
  model: string;
  seriesId: string;
  powerWp: number;
  powerBand: ResultPowerBand;
  series: ProductSeries;
}

export function modelForPower(series: ProductSeries, powerWp: number): string {
  if (series.id === "LR7-54HVDT") {
    return `LR7-54HVD-T-${powerWp}M`;
  }
  return `${series.modelFamily}-${powerWp}M`;
}

/** 该系列在指定功率档下可选的标称功率；不可用则 null */
export function resolvePowerForBand(
  series: ProductSeries,
  band: ResultPowerBand
): number | null {
  for (const powerWp of BAND_POWERS[band]) {
    if (powerWp >= series.powerMinWp && powerWp <= series.powerMaxWp) {
      return powerWp;
    }
  }
  return null;
}

export function isPowerBandAvailable(
  series: ProductSeries,
  band: ResultPowerBand
): boolean {
  return resolvePowerForBand(series, band) !== null;
}

export function defaultPowerBandForSeries(
  series: ProductSeries
): ResultPowerBand {
  for (const band of RESULT_POWER_BANDS) {
    if (isPowerBandAvailable(series, band)) return band;
  }
  return "default";
}

export function buildSku(
  series: ProductSeries,
  band: ResultPowerBand
): ProductSku | undefined {
  const powerWp = resolvePowerForBand(series, band);
  if (powerWp == null) return undefined;
  return {
    model: modelForPower(series, powerWp),
    seriesId: series.id,
    powerWp,
    powerBand: band,
    series,
  };
}

/** Drive 完整型号列表（按系列，不含功率档展开） */
export function listDriveProductModels(
  catalog: ProductSeries[] = PRODUCT_MATRIX
): ProductSeries[] {
  return catalog;
}

export function skuFromSeriesAndBand(
  seriesId: string,
  band: ResultPowerBand,
  catalog: ProductSeries[] = PRODUCT_MATRIX
): ProductSku | undefined {
  const series =
    getProductSeriesById(seriesId) ?? catalog.find((s) => s.id === seriesId);
  if (!series) return undefined;
  const resolved =
    buildSku(series, band) ??
    buildSku(series, defaultPowerBandForSeries(series));
  return resolved;
}

/** 从已有型号字符串反推系列与最接近的功率档 */
export function inferBandFromSeries(series: ProductSeries): ResultPowerBand {
  return defaultPowerBandForSeries(series);
}
