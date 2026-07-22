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
  it("lists complete model families including 72HVH / LR8", () => {
    const ids = listDriveProductModels().map((m) => m.id);
    expect(ids).toContain("LR7-54HVB");
    expect(ids).toContain("LR7-72HVD");
    expect(ids).toContain("LR7-72HVH");
    expect(ids).toContain("LR7-72HVHF");
    expect(ids).toContain("LR7-72HVDF");
    expect(ids).toContain("LR7-54HVD");
    expect(ids).toContain("LR8-48HVH");
    expect(ids).toContain("LR8-66HVD");
    expect(ids.length).toBeGreaterThanOrEqual(15);
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
