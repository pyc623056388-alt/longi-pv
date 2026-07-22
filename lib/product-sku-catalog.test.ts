import { describe, expect, it } from "vitest";
import {
  getProductSkuByModel,
  listDriveProductSkus,
} from "./product-sku-catalog";

describe("product-sku-catalog", () => {
  it("expands every Drive series power bin (5W steps)", () => {
    const skus = listDriveProductSkus();
    const models = skus.map((s) => s.model);

    expect(models).toContain("LR7-54HVB-475M");
    expect(models).toContain("LR7-54HVB-495M");
    expect(models).toContain("LR7-54HVD-T-465M");
    expect(models).toContain("LR7-54HVD-T-495M");
    expect(models).toContain("LR7-60HVD-530M");
    expect(models).toContain("LR7-72HVD-665M");
    expect(skus.length).toBeGreaterThan(40);
  });

  it("maps sku model back to series id for Drive resources", () => {
    const sku = getProductSkuByModel("LR7-54HVHF-490M");
    expect(sku?.seriesId).toBe("LR7-54HVHF");
    expect(sku?.powerWp).toBe(490);
  });
});
