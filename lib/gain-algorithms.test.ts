import { describe, expect, it } from "vitest";
import {
  ANTI_SHADING_PCT,
  LOW_LIGHT_GAIN_PAN_MAX_PCT,
  LOW_LIGHT_IRRADIANCE_WEIGHTS,
  STANDARD_LOW_LIGHT_PCT,
  antiShadingGainBreakdown,
  antiShadingGainPct,
  computeCellTemperatureC,
  deltaTFromCellTemp,
  hasCompleteLowLightProfile,
  lowLightGainBreakdown,
  lowLightGainPct,
  strategyGainPct,
  temperatureGainBreakdown,
  temperatureGainPct,
} from "./gain-algorithms";
import type { ModuleSpec } from "./pv-calculation";
import { DEFAULT_GAIN_STRATEGIES } from "./pv-types";

const longi = {
  power: "590",
  tempCoef: "-0.26",
  firstYearDeg: "0.8",
  annualDeg: "0.35",
  price: "0.25",
};

const competitor = {
  power: "580",
  tempCoef: "-0.29",
  firstYearDeg: "1",
  annualDeg: "0.4",
  price: "0.23",
};

/** BC vs TOPCon 截图 PAN 弱光四点 */
const longiScreenshotPan: ModuleSpec = {
  ...longi,
  lowLightRelEffic: {
    200: -1.19,
    400: 0.55,
    600: 0.95,
    800: 0.74,
  },
};

const compScreenshotPan: ModuleSpec = {
  ...competitor,
  lowLightRelEffic: {
    200: -1.12,
    400: 0.54,
    600: 0.91,
    800: 0.62,
  },
};

/** 库内典型 BC vs TOPCon PAN 对 */
const longiTypicalPan: ModuleSpec = {
  ...longi,
  lowLightRelEffic: {
    200: -1.58,
    400: 0.17,
    600: 0.44,
    800: 0.36,
  },
};

const compTypicalPan: ModuleSpec = {
  ...competitor,
  lowLightRelEffic: {
    200: -1.87,
    400: -0.59,
    600: -0.26,
    800: -0.21,
  },
};

describe("temperatureGainPct", () => {
  it("returns 0.75% for default BC vs TOPCon at ΔT=25", () => {
    expect(temperatureGainPct(longi, competitor)).toBeCloseTo(0.75);
  });

  it("returns 0 when temperature coefficients are equal", () => {
    expect(
      temperatureGainPct(
        { ...longi, tempCoef: "-0.29" },
        { ...competitor, tempCoef: "-0.29" }
      )
    ).toBe(0);
  });

  it("returns 0 when longi has worse (larger abs) temp coef", () => {
    expect(
      temperatureGainPct(
        { ...longi, tempCoef: "-0.36" },
        { ...competitor, tempCoef: "-0.29" }
      )
    ).toBe(0);
  });

  it("respects custom deltaT", () => {
    expect(temperatureGainPct(longi, competitor, { deltaT: 20 })).toBeCloseTo(0.6);
  });
});

describe("temperatureGainBreakdown", () => {
  it("matches hand calculation for default specs", () => {
    const b = temperatureGainBreakdown(longi, competitor);
    expect(b.gammaLongiPct).toBe(0.26);
    expect(b.gammaCompPct).toBe(0.29);
    expect(b.deltaT).toBe(25);
    expect(b.longiLossPct).toBeCloseTo(6.5);
    expect(b.compLossPct).toBeCloseTo(7.25);
    expect(b.gainPct).toBeCloseTo(0.75);
  });
});

describe("PVsyst cell temperature helpers", () => {
  it("computes Tcell from PVsyst formula", () => {
    const tCell = computeCellTemperatureC({
      tambC: 25,
      gincWm2: 800,
      moduleEfficiency: 0.22,
    });
    expect(tCell).toBeCloseTo(25 + (1 / 29) * 0.9 * 800 * 0.78, 2);
  });

  it("derives deltaT from cell temperature", () => {
    expect(deltaTFromCellTemp(50)).toBe(25);
  });
});

describe("lowLightGainBreakdown", () => {
  it("falls back to 0.8% standard when PAN incomplete", () => {
    const b = lowLightGainBreakdown(longi, competitor, "standard");
    expect(b.source).toBe("standard");
    expect(b.gainPct).toBe(STANDARD_LOW_LIGHT_PCT);
    expect(b.points).toHaveLength(0);
  });

  it("conservative rule always uses 0.8%", () => {
    const b = lowLightGainBreakdown(
      longiTypicalPan,
      compTypicalPan,
      "conservative"
    );
    expect(b.gainPct).toBe(STANDARD_LOW_LIGHT_PCT);
    expect(b.source).toBe("standard");
  });

  it("pan rule returns 0 when PAN incomplete", () => {
    expect(lowLightGainPct(longi, competitor, "pan")).toBe(0);
  });

  it("matches screenshot pair weighted gain (~0.04%)", () => {
    const b = lowLightGainBreakdown(
      longiScreenshotPan,
      compScreenshotPan,
      "standard"
    );
    expect(b.source).toBe("pan");
    const expected =
      LOW_LIGHT_IRRADIANCE_WEIGHTS[200] * 0 +
      LOW_LIGHT_IRRADIANCE_WEIGHTS[400] * 0.01 +
      LOW_LIGHT_IRRADIANCE_WEIGHTS[600] * 0.04 +
      LOW_LIGHT_IRRADIANCE_WEIGHTS[800] * 0.12;
    expect(b.gainPanPct).toBeCloseTo(expected, 4);
    expect(b.gainPct).toBeCloseTo(expected, 4);
    expect(b.gainPct).toBeLessThan(0.2);
  });

  it("computes typical library PAN pair in 0.5–1.0% range", () => {
    const b = lowLightGainBreakdown(
      longiTypicalPan,
      compTypicalPan,
      "standard"
    );
    expect(b.source).toBe("pan");
    expect(b.gainPct).toBeGreaterThan(0.5);
    expect(b.gainPct).toBeLessThanOrEqual(LOW_LIGHT_GAIN_PAN_MAX_PCT);
  });

  it("clamps PAN gain to max 1.2%", () => {
    const strongLongi: ModuleSpec = {
      ...longi,
      lowLightRelEffic: { 200: 5, 400: 5, 600: 5, 800: 5 },
    };
    const weakComp: ModuleSpec = {
      ...competitor,
      lowLightRelEffic: { 200: -5, 400: -5, 600: -5, 800: -5 },
    };
    expect(lowLightGainPct(strongLongi, weakComp, "standard")).toBe(
      LOW_LIGHT_GAIN_PAN_MAX_PCT
    );
  });
});

describe("hasCompleteLowLightProfile", () => {
  it("requires all four irradiance levels", () => {
    expect(hasCompleteLowLightProfile(longi)).toBe(false);
    expect(hasCompleteLowLightProfile(longiScreenshotPan)).toBe(true);
    expect(
      hasCompleteLowLightProfile({
        ...longi,
        lowLightRelEffic: { 400: 0.5 },
      })
    ).toBe(false);
  });
});

describe("strategyGainPct", () => {
  it("returns fixed pct for antiShading and lowLight without PAN", () => {
    expect(
      strategyGainPct(
        "antiShading",
        longi,
        competitor,
        DEFAULT_GAIN_STRATEGIES
      )
    ).toBe(1.2);
    expect(
      strategyGainPct("lowLight", longi, competitor, DEFAULT_GAIN_STRATEGIES)
    ).toBe(0.8);
  });

  it("returns non-negative temperature gain when longi has better temp coef", () => {
    const pct = strategyGainPct(
      "temperature",
      longi,
      competitor,
      DEFAULT_GAIN_STRATEGIES
    );
    expect(pct).toBeCloseTo(0.75);
  });

  it("uses PAN lowLight when specs include RelEffic", () => {
    const strategies = {
      ...DEFAULT_GAIN_STRATEGIES,
      lowLight: { enabled: true, ruleId: "standard" as const },
    };
    const pct = strategyGainPct(
      "lowLight",
      longiTypicalPan,
      compTypicalPan,
      strategies
    );
    expect(pct).toBeGreaterThan(0.5);
    expect(pct).not.toBe(0.8);
  });
});

describe("antiShadingGainPct", () => {
  it("returns scenario-specific constants", () => {
    expect(antiShadingGainPct("standard", "residential")).toBe(
      ANTI_SHADING_PCT.residential
    );
    expect(antiShadingGainPct("standard", "commercial")).toBe(
      ANTI_SHADING_PCT.commercial
    );
  });

  it("defaults to residential", () => {
    expect(antiShadingGainPct("standard")).toBe(1.2);
  });
});

describe("antiShadingGainBreakdown", () => {
  it("exposes scenario and gain for UI", () => {
    const b = antiShadingGainBreakdown("commercial");
    expect(b.scenario).toBe("commercial");
    expect(b.gainPct).toBe(0.4);
  });
});

describe("fixed gain helpers", () => {
  it("matches standard lowLight constant without PAN", () => {
    expect(lowLightGainPct(longi, competitor, "standard")).toBe(0.8);
  });
});
