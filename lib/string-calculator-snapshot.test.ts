import { describe, expect, it } from "vitest";
import { stringCalcExportBasename } from "./string-calculator-snapshot";

describe("stringCalcExportBasename", () => {
  it("builds a dated filename", () => {
    const name = stringCalcExportBasename(
      {
        clientName: "Elecnor",
        projectName: "Richmond Valley Solar Farm",
        location: "Myrtle Creek, NSW, Australia",
        coordinates: "-29.1, 153.0",
      },
      new Date("2026-05-19T00:00:00.000Z")
    );
    expect(name).toBe(
      "20260519 String Calculation Elecnor Richmond Valley Solar Farm"
    );
  });
});
