import { describe, expect, it } from "vitest";
import { getProductSeriesById } from "./product-matrix-catalog";
import {
  buildSku,
  defaultPowerBandForSeries,
  isPowerBandAvailable,
  listDriveProductModels,
  resolvePowerForBand,
  skuFromSeriesAndBand,
} from "./product-sku-catalog";

describe("product-sku-catalog power bands", () => {
  it("lists only Product-Segments models from Drive 01 matrix", () => {
    const ids = listDriveProductModels().map((m) => m.id);
    expect(ids).toEqual([
      "LR7-54HVB",
      "LR7-54HVH",
      "LR7-54HVHF",
      "LR7-54HVDT",
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
    expect(ids).not.toContain("LR7-54HVD");
    expect(ids).not.toContain("LR8-48HVH");
  });

  it("uses 475 or 480 for default, 540 mid, 650 large", () => {
    const hvb = getProductSeriesById("LR7-54HVB")!;
    const hvhf = getProductSeriesById("LR7-54HVHF")!;
    const hvd60 = getProductSeriesById("LR7-60HVD")!;
    const hvd72 = getProductSeriesById("LR7-72HVD")!;

    expect(resolvePowerForBand(hvb, "default")).toBe(475);
    expect(resolvePowerForBand(hvhf, "default")).toBe(480);
    expect(resolvePowerForBand(hvd60, "medium")).toBe(540);
    expect(resolvePowerForBand(hvd72, "large")).toBe(650);

    expect(isPowerBandAvailable(hvb, "large")).toBe(false);
    expect(isPowerBandAvailable(hvd72, "default")).toBe(false);
    expect(defaultPowerBandForSeries(hvd60)).toBe("medium");
  });

  it("builds display model from series + band", () => {
    expect(buildSku(getProductSeriesById("LR7-54HVB")!, "default")?.model).toBe(
      "LR7-54HVB-475M"
    );
    expect(buildSku(getProductSeriesById("LR7-54HVDT")!, "default")?.model).toBe(
      "LR7-54HVD-T-475M"
    );
    expect(skuFromSeriesAndBand("LR7-72HVD", "large")?.model).toBe(
      "LR7-72HVD-650M"
    );
  });
});
