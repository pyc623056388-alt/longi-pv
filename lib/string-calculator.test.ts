import { describe, expect, it } from "vitest";
import {
  alphaVocFromModule,
  calculateModuleString,
  calculateStringVoltage,
  DEFAULT_ALPHA_VOC_PER_C,
  iecCorrectionFactor,
  vocAtTemperature,
} from "./string-calculator";

const hyd745 = {
  id: "745",
  model: "LR9-66HYD-745M",
  powerWp: 745,
  vocStc: 49.13,
  alphaVocPerC: -0.002,
  modulesPerString: 29,
};

const hyd750 = {
  id: "750",
  model: "LR9-66HYD-750M",
  powerWp: 750,
  vocStc: 49.2,
  alphaVocPerC: -0.002,
  modulesPerString: 29,
};

const letterParams = {
  tEamdbtC: 1.0,
  voltageLimitV: 1500,
};

describe("vocAtTemperature general method", () => {
  it("matches the 745W letter example at 1.0°C", () => {
    const voc = vocAtTemperature(49.13, -0.002, 1.0);
    expect(voc).toBeCloseTo(51.48824, 5);
    expect(voc * 29).toBeCloseTo(1493.15896, 4);
    expect(Math.round(voc * 29)).toBe(1493);
  });

  it("matches the 750W letter example at 1.0°C", () => {
    const voc = vocAtTemperature(49.2, -0.002, 1.0);
    expect(voc).toBeCloseTo(51.5616, 5);
    expect(Math.round(voc * 29)).toBe(1495);
  });
});

describe("IEC 62548-1:2023 F.1.1.b", () => {
  it("adds 10 K then applies K_U for 745W", () => {
    const { betaVPerC, ku } = iecCorrectionFactor(49.13, -0.002, 11.0);
    expect(betaVPerC).toBeCloseTo(-0.09826, 5);
    expect(ku).toBeCloseTo(1.028, 3);
    const uOcArray = 29 * 49.13;
    expect(uOcArray).toBeCloseTo(1424.77, 2);
    expect(Math.round(ku * uOcArray)).toBe(1465);
  });

  it("matches the 750W letter rounding to 1467 V", () => {
    const { ku } = iecCorrectionFactor(49.2, -0.002, 11.0);
    expect(Math.round(ku * 29 * 49.2)).toBe(1467);
  });
});

describe("calculateModuleString", () => {
  it("flags 29-module 745W general Voc under 1500 V", () => {
    const row = calculateModuleString(hyd745, letterParams);
    expect(row.general.stringVocRoundedV).toBe(1493);
    expect(row.iec.stringVocRoundedV).toBe(1465);
    expect(row.general.withinLimit).toBe(true);
    expect(row.iec.withinLimit).toBe(true);
    expect(row.iec.tUsedC).toBe(11);
    expect(row.general.maxModules).toBeGreaterThanOrEqual(29);
  });

  it("computes max modules against the voltage limit", () => {
    const row = calculateModuleString(hyd745, {
      tEamdbtC: 1.0,
      voltageLimitV: 1000,
    });
    expect(row.general.withinLimit).toBe(false);
    expect(row.general.maxModules).toBe(
      Math.floor(1000 / row.general.vocModuleV)
    );
  });
});

describe("calculateStringVoltage", () => {
  it("returns a row per module", () => {
    const result = calculateStringVoltage([hyd745, hyd750], letterParams);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]!.general.stringVocRoundedV).toBe(1493);
    expect(result.rows[1]!.general.stringVocRoundedV).toBe(1495);
  });
});

describe("alphaVocFromModule", () => {
  it("uses PAN vocTempCoefPct when present", () => {
    expect(alphaVocFromModule(-0.2176)).toBeCloseTo(-0.002176, 6);
  });

  it("falls back to -0.20 %/°C", () => {
    expect(alphaVocFromModule(undefined)).toBe(DEFAULT_ALPHA_VOC_PER_C);
  });
});
