import { describe, expect, it } from "vitest";
import { PRODUCT_MATRIX, getProductSeriesById } from "./product-matrix-catalog";

/** AU DG Limited Warranty 型号表 + 对应 AU Datasheet（质保/尺寸/重量） */
describe("PRODUCT_MATRIX AU warranty and key specs", () => {
  it("covers exactly the Drive Product-Segments series set", () => {
    expect(PRODUCT_MATRIX.map((s) => s.id).sort()).toEqual(
      [
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
      ].sort()
    );
  });

  it.each([
    ["LR7-54HVB", 30, 30, 21.6, "1800×1134×30", 24.3],
    ["LR7-54HVH", 25, 30, 21.6, "1800×1134×30", 24.5],
    ["LR7-54HVHF", 25, 30, 21.6, "1800×1134×30", 24.5],
    ["LR7-54HVD", 25, 30, 23.5, "1800×1134×30", 24.5],
    ["LR8-48HVH", 25, 30, 21.6, "1762×1134×30", 24.5],
    ["LR8-48HVD", 25, 30, 23.5, "1762×1134×30", 24.5],
    ["LR7-60HVH", 25, 30, 25, "1990×1134×30", 24.8],
    ["LR7-60HVD", 25, 30, 28, "1990×1134×30", 24.6],
    ["LR7-60HVHL", 25, 30, 16.3, "1990×1134×30", 24.8],
    ["LR7-72HVD", 15, 30, 33.5, "2382×1134×30", 24.6],
    ["LR7-72HVDF", 15, 30, 33.5, "2382×1134×30", 24.6],
    ["LR7-72HVH", 15, 30, 28.5, "2382×1134×30", 24.8],
    ["LR7-72HVHF", 15, 30, 28.5, "2382×1134×30", 24.8],
    ["LR8-66HVD", 15, 30, 32.5, "2382×1134×30", 24.8],
    ["LR8-66HVDF", 15, 30, 33.5, "2382×1134×30", 24.62],
    ["LR8-66HYD", 12, 30, 32.7, "2382×1134×30", 24.8],
  ] as const)(
    "%s product/power warranty, weight, size, efficiency",
    (id, productY, perfY, weight, dim, eff) => {
      const s = getProductSeriesById(id)!;
      expect(s.productWarrantyYears).toBe(productY);
      expect(s.performanceWarrantyYears).toBe(perfY);
      expect(s.weightKg).toBe(weight);
      expect(s.dimensionMm).toBe(dim);
      expect(s.efficiencyMaxPct).toBe(eff);
      expect(s.firstYearDegradationPct).toBe(1);
      expect(s.annualDegradationPct).toBe(0.35);
      expect(s.pmpTempCoef).toBe(-0.26);
    }
  );

  it("keeps LR7-72 series unified at datasheet 645–670", () => {
    for (const id of ["LR7-72HVD", "LR7-72HVDF", "LR7-72HVH", "LR7-72HVHF"]) {
      const s = getProductSeriesById(id)!;
      expect(s.powerMinWp).toBe(645);
      expect(s.powerMaxWp).toBe(670);
      expect(s.datasheetFile).toBe(`AU_Datasheet_X10_${id}_645-670.pdf`);
    }
  });

  it("keeps HYD power band within AU datasheet 640–670", () => {
    const hyd = getProductSeriesById("LR8-66HYD")!;
    expect(hyd.powerMinWp).toBe(640);
    expect(hyd.powerMaxWp).toBe(670);
  });

  it("maps LR7-54HVD to transparent dual-glass 475–500", () => {
    const hvd = getProductSeriesById("LR7-54HVD")!;
    expect(hvd.generation).toBe("transparent");
    expect(hvd.glass).toBe("dual");
    expect(hvd.powerMinWp).toBe(475);
    expect(hvd.powerMaxWp).toBe(500);
    expect(hvd.representativeModel).toBe("LR7-54HVD-475M");
    expect(hvd.datasheetFile).toBe("AU_Datasheet_X10_LR7-54HVD_475-500.pdf");
  });
});
