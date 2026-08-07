import { describe, expect, it } from "vitest";
import { getProductSeriesById } from "./product-matrix-catalog";
import {
  buildSku,
  formatDatasheetPowerRange,
  listDriveProductModels,
  skuFromSeriesId,
} from "./product-sku-catalog";

describe("product-sku-catalog datasheet power range", () => {
  it("lists only Product-Segments models from Drive 01 matrix", () => {
    const ids = listDriveProductModels().map((m) => m.id);
    expect(ids).toEqual([
      "LR7-54HVB",
      "LR7-54HVH",
      "LR7-54HVHF",
      "LR7-54HVD",
      "LR8-48HVH",
      "LR8-48HVD",
      "LR7-60HVH",
      "LR7-60HVD",
      "LR7-60HVHL",
      "LR7-72HVD",
      "LR7-72HVDF",
      "LR7-72HVH",
      "LR7-72HVHF",
      "LR8-66HVD",
      "LR8-66HVDF",
      "LR8-66HYD",
    ]);
    expect(ids).not.toContain("LR7-54HVDT");
  });

  it("exposes datasheet power ranges per series", () => {
    expect(formatDatasheetPowerRange(getProductSeriesById("LR7-54HVB")!)).toBe(
      "475~500"
    );
    expect(formatDatasheetPowerRange(getProductSeriesById("LR7-54HVHF")!)).toBe(
      "475~500"
    );
    expect(formatDatasheetPowerRange(getProductSeriesById("LR8-66HYD")!)).toBe(
      "635~670"
    );
    expect(formatDatasheetPowerRange(getProductSeriesById("LR7-54HVD")!)).toBe(
      "475~500"
    );
    expect(formatDatasheetPowerRange(getProductSeriesById("LR7-60HVD")!)).toBe(
      "530~555"
    );
    expect(formatDatasheetPowerRange(getProductSeriesById("LR7-72HVD")!)).toBe(
      "645~670"
    );
    expect(formatDatasheetPowerRange(getProductSeriesById("LR7-72HVHF")!)).toBe(
      "645~670"
    );
  });

  it("builds display model from series representative power", () => {
    expect(buildSku(getProductSeriesById("LR7-54HVB")!).model).toBe(
      "LR7-54HVB-475M"
    );
    expect(buildSku(getProductSeriesById("LR7-54HVD")!).model).toBe(
      "LR7-54HVD-475M"
    );
    expect(buildSku(getProductSeriesById("LR8-48HVH")!).model).toBe(
      "LR8-48HVH-475M"
    );
    expect(skuFromSeriesId("LR7-72HVD")?.model).toBe("LR7-72HVD-650M");
    expect(skuFromSeriesId("LR7-72HVD")?.powerMinWp).toBe(645);
    expect(skuFromSeriesId("LR7-72HVD")?.powerMaxWp).toBe(670);
  });
});
