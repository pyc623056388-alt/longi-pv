/**
 * Drive Product-Segments 全功率档 SKU（按 Datasheet 功率区间、5W 步进展开）
 * 下拉浏览用；资料仍按 seriesId 挂载。
 */

import {
  PRODUCT_MATRIX,
  getProductSeriesById,
  type ProductSeries,
} from "./product-matrix-catalog";

export interface ProductSku {
  /** 完整型号，如 LR7-54HVB-480M */
  model: string;
  seriesId: string;
  powerWp: number;
  series: ProductSeries;
}

function modelForPower(series: ProductSeries, powerWp: number): string {
  // 透明双面在对比库 / Drive 命名为 LR7-54HVD-T-xxxM
  if (series.id === "LR7-54HVDT") {
    return `LR7-54HVD-T-${powerWp}M`;
  }
  return `${series.modelFamily}-${powerWp}M`;
}

/** 展开 Drive 产品矩阵全部功率档 */
export function listDriveProductSkus(
  catalog: ProductSeries[] = PRODUCT_MATRIX
): ProductSku[] {
  const skus: ProductSku[] = [];
  for (const series of catalog) {
    for (
      let powerWp = series.powerMinWp;
      powerWp <= series.powerMaxWp;
      powerWp += 5
    ) {
      skus.push({
        model: modelForPower(series, powerWp),
        seriesId: series.id,
        powerWp,
        series,
      });
    }
  }
  return skus;
}

export function getProductSkuByModel(
  model: string,
  catalog: ProductSeries[] = PRODUCT_MATRIX
): ProductSku | undefined {
  return listDriveProductSkus(catalog).find((s) => s.model === model);
}

/** 由系列代表型号或系列 id 回退到默认 SKU */
export function defaultSkuForSeries(
  seriesId: string,
  catalog: ProductSeries[] = PRODUCT_MATRIX
): ProductSku | undefined {
  const series = getProductSeriesById(seriesId) ?? catalog.find((s) => s.id === seriesId);
  if (!series) return undefined;
  return {
    model: series.representativeModel,
    seriesId: series.id,
    powerWp: series.representativePowerWp,
    series,
  };
}
