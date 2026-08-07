/**
 * Step2：按 Drive 系列选型；功率段取自 datasheet（powerMinWp~powerMaxWp），
 * 跳转对比页使用系列代表功率。
 */

import {
  PRODUCT_MATRIX,
  getProductSeriesById,
  type ProductSeries,
} from "./product-matrix-catalog";

export interface ProductSku {
  model: string;
  seriesId: string;
  powerWp: number;
  powerMinWp: number;
  powerMaxWp: number;
  series: ProductSeries;
}

export function modelForPower(series: ProductSeries, powerWp: number): string {
  return `${series.modelFamily}-${powerWp}M`;
}

/** Datasheet 功率段文案，如 475~500 */
export function formatDatasheetPowerRange(series: ProductSeries): string {
  return `${series.powerMinWp}~${series.powerMaxWp}`;
}

export function buildSku(series: ProductSeries): ProductSku {
  const powerWp = series.representativePowerWp;
  return {
    model: modelForPower(series, powerWp),
    seriesId: series.id,
    powerWp,
    powerMinWp: series.powerMinWp,
    powerMaxWp: series.powerMaxWp,
    series,
  };
}

/** Drive 完整型号列表（按系列） */
export function listDriveProductModels(
  catalog: ProductSeries[] = PRODUCT_MATRIX
): ProductSeries[] {
  return catalog;
}

export function skuFromSeriesId(
  seriesId: string,
  catalog: ProductSeries[] = PRODUCT_MATRIX
): ProductSku | undefined {
  const series =
    getProductSeriesById(seriesId) ?? catalog.find((s) => s.id === seriesId);
  if (!series) return undefined;
  return buildSku(series);
}
