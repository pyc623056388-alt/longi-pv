import { describe, expect, it } from "vitest";
import {
  LEGAL_DEVELOPER,
  LEGAL_FEEDBACK_EMAIL,
  LEGAL_SUPPORT,
} from "./legal-meta";
import { calculatePvComparison } from "./pv-calculation";
import { buildReportSnapshot, reportPdfFilename } from "./report-snapshot";
import { DEFAULT_BASIC_PARAMS, DEFAULT_GAIN_STRATEGIES } from "./pv-types";

const longi = {
  power: "590",
  tempCoef: "-0.26",
  firstYearDeg: "0.8",
  annualDeg: "0.35",
  price: "0.25",
  name: "Hi-MO 7",
};

const competitor = {
  power: "580",
  tempCoef: "-0.29",
  firstYearDeg: "1",
  annualDeg: "0.4",
  price: "0.23",
  name: "TOPCon",
};

describe("buildReportSnapshot", () => {
  it("matches calculation results and formats project name", () => {
    const results = calculatePvComparison({
      moduleCount: 1000,
      mode: "sameCount",
      longi,
      competitor,
      basicParams: DEFAULT_BASIC_PARAMS,
      gainStrategies: DEFAULT_GAIN_STRATEGIES,
    });

    const snap = buildReportSnapshot({
      projectName: "",
      weather: { id: "w1", name: "悉尼 Sydney", location: "AU" },
      comparisonMode: "sameCount",
      moduleCount: "1000",
      basicParams: DEFAULT_BASIC_PARAMS,
      gainStrategies: DEFAULT_GAIN_STRATEGIES,
      longi,
      competitor,
      results,
      generatedAt: new Date("2026-05-25T10:00:00"),
    });

    expect(snap.projectName).toBe("未命名项目");
    expect(snap.usedDefaultProjectName).toBe(true);
    expect(snap.weatherName).toBe("悉尼");
    expect(snap.results).toBe(results);
    expect(snap.highlights[0].value).toBe(
      `${results.yieldGainPct >= 0 ? "+" : ""}${results.yieldGainPct.toFixed(2)}`
    );
    expect(snap.highlights[0].variant).toBe(
      results.yieldGainPct >= 0 ? "positive" : "negative"
    );
    expect(snap.gainStrategies).toHaveLength(3);
    expect(snap.attribution).toContain(LEGAL_DEVELOPER);
    expect(snap.attribution).toContain(LEGAL_SUPPORT);
    expect(snap.legalNotice).toContain(LEGAL_DEVELOPER);
    expect(snap.feedback).toContain(LEGAL_FEEDBACK_EMAIL);
    expect(snap.attribution).toContain("技术支持");
    expect(snap.watermark).toContain("严禁外发");
  });
});

describe("reportPdfFilename", () => {
  it("sanitizes illegal characters", () => {
    expect(
      reportPdfFilename(
        '测试<>:"/\\|?*',
        "zh",
        new Date(Date.UTC(2026, 4, 25, 12, 0, 0))
      )
    ).toBe("LONGi-PV_测试__________2026-05-25.pdf");
  });
});
