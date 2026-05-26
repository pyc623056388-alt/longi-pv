import { describe, expect, it } from "vitest";
import {
  parseStcMultiColumnTable,
  parseTextForPowerRow,
  scoreExtraction,
} from "./datasheet-extract";

const CANADIAN_SNIPPET = `
ELECTRICAL DATA | STC*
CS6.2-54TM465470475480485490
Nominal Max. Power (Pmax)465 W470 W475 W480 W485 W490 W
Opt. Operating Voltage (Vmp)32.0 V32.2 V32.4 V32.6 V32.8 V33.0 V
Opt. Operating Current (Imp)14.54 A14.60 A14.67 A14.73 A14.79 A14.85 A
Open Circuit Voltage (Voc)38.2 V38.4 V38.6 V38.8 V39.0 V39.2 V
Short Circuit Current (Isc)15.55 A15.61 A15.67 A15.74 A15.80 A15.86 A
1961 × 1134 × 30 mm
Temperature Coefficient (Pmax)-0.29 % / °C
`;

describe("datasheet-extract", () => {
  it("parses Canadian Solar multi-column STC table at 475W", () => {
    const row = parseStcMultiColumnTable(CANADIAN_SNIPPET, 475);
    expect(row).not.toBeNull();
    expect(row?.powerWp).toBe(475);
    expect(row?.vmp).toBe(32.4);
    expect(row?.imp).toBe(14.67);
    expect(row?.voc).toBe(38.6);
    expect(row?.isc).toBe(15.67);
    expect(scoreExtraction(row)).toBe(1);
  });

  it("parseTextForPowerRow reads 475W row from multi-column table", () => {
    const row = parseTextForPowerRow(CANADIAN_SNIPPET, 475);
    expect(row?.voc).toBe(38.6);
    expect(row?.imp).toBe(14.67);
  });
});
