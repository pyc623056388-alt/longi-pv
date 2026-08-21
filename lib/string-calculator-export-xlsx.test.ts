import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { calculateStringVoltage } from "./string-calculator";
import { buildStringCalcWorkbook } from "./string-calculator-export-xlsx";
import type { StringCalcSnapshot } from "./string-calculator-snapshot";

function sampleSnapshot(): StringCalcSnapshot {
  const modules = [
    {
      id: "a",
      model: "LR8-66HYD-645M",
      powerWp: 645,
      vocStc: 50.12,
      alphaVocPerC: -0.0021,
      modulesPerString: 29,
    },
    {
      id: "b",
      model: "LR8-66HYD-670M",
      powerWp: 670,
      vocStc: 50.4,
      alphaVocPerC: -0.0021,
      modulesPerString: 29,
    },
  ];
  return {
    generatedAtIso: "2026-08-21T00:00:00.000Z",
    project: {
      clientName: "Elecnor",
      projectName: "Richmond Valley Solar Farm",
      location: "Myrtle Creek, NSW, Australia",
      coordinates: "-29.098827, 153.047678",
    },
    weather: {
      stationName: "Casino",
      wmo: "945730",
      distanceKm: 12.4,
      period: "1991-2020",
      ashraeVersion: "2021",
      tEamdbtC: 0.9,
      tminManual: false,
      sourceUrl: "https://ashrae-meteo.info/v3.0/",
    },
    voltageLimitV: 1500,
    modules,
    result: calculateStringVoltage(modules, {
      tEamdbtC: 0.9,
      voltageLimitV: 1500,
    }),
  };
}

describe("buildStringCalcWorkbook", () => {
  it("builds a side-by-side calculation sheet with Excel formulas", async () => {
    const blob = await buildStringCalcWorkbook(sampleSnapshot());
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await blob.arrayBuffer());

    expect(wb.worksheets.map((s) => s.name)).toEqual([
      "Project Weather",
      "Calculator MANUAL",
      "Summary",
    ]);

    const calc = wb.getWorksheet("Calculator MANUAL");
    expect(calc).toBeDefined();
    expect(calc?.getCell("D14").value).toBe("LR8-66HYD-645M");
    expect(calc?.getCell("E14").value).toBe("LR8-66HYD-670M");
    expect(calc?.getCell("D16").value).toBe(50.12);
    expect(calc?.getCell("A21").value).toMatch(/IEC 62548/);

    const tCell = calc?.getCell("D23").value as ExcelJS.CellFormulaValue;
    expect(tCell.formula).toBe("$D$7+$D$8");
    expect(tCell.result).toBe(10.9);

    const uOcMax = calc?.getCell("D27").value as ExcelJS.CellFormulaValue;
    expect(uOcMax.formula).toBe("D25*D26");
    expect(Number(uOcMax.result)).toBeCloseTo(1496.52, 1);

    const conv = calc?.getCell("D36").value as ExcelJS.CellFormulaValue;
    expect(conv.formula).toBe("D35*D19");
  });
});
