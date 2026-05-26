import { describe, expect, it } from "vitest";
import {
  comparisonDeltaVariant,
  metricHigherIsBetter,
  parseDeltaValue,
} from "./metric-highlight";

describe("metricHigherIsBetter", () => {
  it("treats cost, payback, and module count as lower-is-better", () => {
    expect(metricHigherIsBetter("项目总成本")).toBe(false);
    expect(metricHigherIsBetter("全站投资回收期 (年)")).toBe(false);
    expect(metricHigherIsBetter("组件块数")).toBe(false);
  });

  it("treats yield and revenue as higher-is-better", () => {
    expect(metricHigherIsBetter("预期发电量 (MWh)")).toBe(true);
    expect(metricHigherIsBetter("净收益")).toBe(true);
  });
});

describe("parseDeltaValue", () => {
  it("parses signed percent and year deltas", () => {
    expect(parseDeltaValue("+4.40%")).toBe(4.4);
    expect(parseDeltaValue("-5.56%")).toBe(-5.56);
    expect(parseDeltaValue("-0.338")).toBe(-0.338);
    expect(parseDeltaValue("—")).toBeNull();
  });
});

describe("comparisonDeltaVariant", () => {
  it("marks cost reduction (negative pct) as positive", () => {
    expect(comparisonDeltaVariant("-5.56%", "项目总成本")).toBe("positive");
  });

  it("marks yield reduction (negative pct) as negative", () => {
    expect(comparisonDeltaVariant("-5.56%", "预期发电量 (MWh)")).toBe(
      "negative"
    );
  });

  it("marks shorter payback (negative year diff) as positive", () => {
    expect(comparisonDeltaVariant("-0.338", "全站投资回收期 (年)")).toBe(
      "positive"
    );
  });

  it("treats near-zero deltas as neutral", () => {
    expect(comparisonDeltaVariant("-0.00%", "组件总成本")).toBe("neutral");
    expect(comparisonDeltaVariant("—", "净收益")).toBe("neutral");
  });

  it("marks fewer modules (negative pct) as positive for LONGi", () => {
    expect(comparisonDeltaVariant("-10.08%", "组件块数")).toBe("positive");
  });

  it("marks more modules (positive pct) as negative for LONGi", () => {
    expect(comparisonDeltaVariant("+4.40%", "组件块数")).toBe("negative");
  });
});
