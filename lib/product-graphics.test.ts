import { describe, expect, it } from "vitest";
import {
  inferCellCountFromModel,
  LONGI_PRODUCT_HERO_IMAGE,
} from "./product-graphics";

describe("inferCellCountFromModel", () => {
  it("extracts cell count from LONGi model names", () => {
    expect(inferCellCountFromModel("LR7-54HVD-475M")).toBe(54);
    expect(inferCellCountFromModel("LR7-60HVHL-540M")).toBe(60);
    expect(inferCellCountFromModel("LR8-66HVD-580M")).toBe(66);
    expect(inferCellCountFromModel("LR7-72HVD-650M")).toBe(72);
  });

  it("returns null for unrecognised models", () => {
    expect(inferCellCountFromModel("UNKNOWN-123")).toBeNull();
    expect(inferCellCountFromModel("")).toBeNull();
  });
});

describe("LONGI_PRODUCT_HERO_IMAGE", () => {
  it("points to the static 60-cell bevel product graphic", () => {
    expect(LONGI_PRODUCT_HERO_IMAGE).toBe(
      "/product-graphics/cell-60-bevel.png"
    );
  });
});
