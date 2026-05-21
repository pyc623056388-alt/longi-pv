import { describe, expect, it } from "vitest";
import {
  antiShadingGainPct,
  lowLightGainPct,
  strategyGainPct,
} from "./gain-algorithms";
import { DEFAULT_GAIN_STRATEGIES } from "./pv-types";

const longi = {
  power: "590",
  tempCoef: "-0.29",
  firstYearDeg: "1",
  annualDeg: "0.4",
  price: "0.95",
};

const competitor = {
  power: "580",
  tempCoef: "-0.34",
  firstYearDeg: "1.5",
  annualDeg: "0.45",
  price: "0.88",
};

describe("strategyGainPct", () => {
  it("returns fixed pct for antiShading and lowLight", () => {
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
    expect(pct).toBeGreaterThan(0);
  });
});

describe("fixed gain helpers", () => {
  it("matches standard constants", () => {
    expect(antiShadingGainPct("standard")).toBe(1.2);
    expect(lowLightGainPct("standard")).toBe(0.8);
  });
});
