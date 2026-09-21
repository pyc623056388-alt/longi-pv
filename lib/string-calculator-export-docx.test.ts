import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { calculateStringVoltage } from "./string-calculator";
import { buildStringCalcDocx } from "./string-calculator-export-docx";
import type { StringCalcSnapshot } from "./string-calculator-snapshot";

function majorsCreekSnapshot(): StringCalcSnapshot {
  const modules = [
    {
      id: "655",
      model: "LR8-66HYD-655M",
      powerWp: 655,
      vocStc: 49.82,
      alphaVocPerC: -0.002,
      modulesPerString: 29,
    },
  ];
  return {
    generatedAtIso: "2026-07-08T00:00:00.000Z",
    project: {
      clientName: "DT Infrastructure",
      projectName: "Majors Creek Solar Farm",
      location: "40km south of Townsville",
      coordinates: "-19.593472, 146.872187",
    },
    weather: {
      stationName: "TOWNSVILLE, AUSTRALIA",
      wmo: "942940",
      distanceKm: 40,
      stationLat: -19.25,
      stationLon: 146.77,
      period: "1999-2023",
      ashraeVersion: "2025",
      tEamdbtC: 7.7,
      tminManual: false,
      sourceUrl: "https://ashrae-meteo.info/v3.0/",
    },
    voltageLimitV: 1500,
    modules,
    result: calculateStringVoltage(modules, {
      tEamdbtC: 7.7,
      voltageLimitV: 1500,
    }),
  };
}

async function letterText(snapshot: StringCalcSnapshot): Promise<string> {
  const blob = await buildStringCalcDocx(snapshot);
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  const xml = await zip.file("word/document.xml")?.async("string");
  expect(xml).toBeTruthy();
  return (xml ?? "")
    .replace(/<w:tab\b[^/]*\/>/g, " ")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

describe("IEC 62548 Majors Creek numbers", () => {
  it("rounds U_OC,MAX to 1466 V", () => {
    const result = calculateStringVoltage(
      [
        {
          id: "655",
          model: "LR8-66HYD-655M",
          powerWp: 655,
          vocStc: 49.82,
          alphaVocPerC: -0.002,
          modulesPerString: 29,
        },
      ],
      { tEamdbtC: 7.7, voltageLimitV: 1500 }
    );
    const row = result.rows[0]!;
    expect(row.iec.tUsedC).toBeCloseTo(17.7, 5);
    expect(row.iec.betaVPerC).toBeCloseTo(-0.09964, 5);
    expect(row.iec.ku).toBeCloseTo(1.0146, 4);
    expect(row.iec.uOcArrayV).toBeCloseTo(1444.78, 2);
    expect(row.iec.stringVocV).toBeCloseTo(1465.87, 1);
    expect(row.iec.stringVocRoundedV).toBe(1466);
  });
});

describe("buildStringCalcDocx", () => {
  it("writes an IEC declaration letter with a conventional appendix", async () => {
    const snapshot = majorsCreekSnapshot();
    const text = await letterText(snapshot);

    expect(text).toContain("String Voltage Calculation letter");
    expect(text).toContain("DT Infrastructure");
    expect(text).toContain("AS/NZS 5033:2021");
    expect(text).toContain("Clause 4.2.1.3.1(b)");
    expect(text).toContain("IEC 62548-1:2023 Clause F.1.1.b");
    expect(text).toContain("LR8-66HYD-655M");
    expect(text).toContain("U_OC,MAX");
    expect(text).toContain("1466 V");
    expect(text).toContain("compliant with AS/NZS 5033");
    expect(text).toContain("Appendix — Conventional method (not used for the declaration)");
    expect(text).toContain("not the declared string voltage");
    expect(text).toContain("Attachment: LR8-66HYD-655M Datasheet");
    expect(text).toContain("Sang Bui");

    const appendixAt = text.indexOf("Appendix — Conventional method");
    const iecSummaryAt = text.indexOf("compliant with AS/NZS 5033, is 1466 V");
    expect(iecSummaryAt).toBeGreaterThan(0);
    expect(appendixAt).toBeGreaterThan(iecSummaryAt);

    const zip = await JSZip.loadAsync(
      await (await buildStringCalcDocx(snapshot)).arrayBuffer()
    );
    const media = Object.keys(zip.files).filter((name) =>
      name.startsWith("word/media/")
    );
    expect(media.length).toBeGreaterThanOrEqual(2);
  });
});
