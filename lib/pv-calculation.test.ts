import { describe, expect, it } from "vitest";
import {
  calculatePvComparison,
  dynamicPaybackYears,
  paybackBeyondHorizonValue,
} from "./pv-calculation";
import { DEFAULT_BASIC_PARAMS, DEFAULT_GAIN_STRATEGIES } from "./pv-types";

const baseSpec = {
  power: "590",
  tempCoef: "-0.26",
  firstYearDeg: "0.8",
  annualDeg: "0.35",
  price: "0.25",
};

const compSpec = {
  power: "580",
  tempCoef: "-0.29",
  firstYearDeg: "1",
  annualDeg: "0.4",
  price: "0.23",
};

describe("dynamicPaybackYears", () => {
  it("returns 0 when project cost is zero", () => {
    expect(
      dynamicPaybackYears({
        projectCost: 0,
        annualMwhYear1: 100,
        firstYearDegPct: 1,
        annualDegPct: 0.4,
        ppa: 0.15,
        maxYears: 30,
      })
    ).toBe(0);
  });

  it("interpolates within the payback year", () => {
    const years = dynamicPaybackYears({
      projectCost: 150,
      annualMwhYear1: 1,
      firstYearDegPct: 0,
      annualDegPct: 0,
      ppa: 0.1,
      maxYears: 10,
    });
    expect(years).toBeCloseTo(1.5, 5);
  });

  it("returns null when not recovered within maxYears", () => {
    expect(
      dynamicPaybackYears({
        projectCost: 1_000_000,
        annualMwhYear1: 1,
        firstYearDegPct: 1,
        annualDegPct: 0.4,
        ppa: 0.15,
        maxYears: 5,
      })
    ).toBeNull();
  });
});

describe("calculatePvComparison accessory chart", () => {
  it("computes accessoryReductionPct and chartData.accessory", () => {
    const sameCount = calculatePvComparison({
      moduleCount: 100,
      mode: "sameCount",
      longi: baseSpec,
      competitor: compSpec,
      basicParams: DEFAULT_BASIC_PARAMS,
      gainStrategies: DEFAULT_GAIN_STRATEGIES,
    });
    expect(sameCount.longiAccessoryCost).toBe(sameCount.compAccessoryCost);
    expect(sameCount.accessoryReductionPct).toBe(0);
    expect(sameCount.chartData[0].accessory).toBe(
      Math.round(sameCount.longiAccessoryCost)
    );

    const fixedCapacity = calculatePvComparison({
      moduleCount: 100,
      mode: "fixedCapacity",
      longi: { ...baseSpec, power: "600" },
      competitor: compSpec,
      basicParams: DEFAULT_BASIC_PARAMS,
      gainStrategies: DEFAULT_GAIN_STRATEGIES,
    });
    expect(fixedCapacity.longiModuleCount).not.toBe(
      fixedCapacity.compModuleCount
    );
    expect(fixedCapacity.accessoryReductionPct).not.toBe(0);
  });

  it("computes netProfitGainPct and chartData.netProfit", () => {
    const r = calculatePvComparison({
      moduleCount: 100,
      mode: "sameCount",
      longi: baseSpec,
      competitor: compSpec,
      basicParams: DEFAULT_BASIC_PARAMS,
      gainStrategies: DEFAULT_GAIN_STRATEGIES,
    });
    expect(r.chartData[0].netProfit).toBe(Math.round(r.longiNetProfit));
    expect(r.netProfitGainPct).not.toBe(0);
  });
});

describe("calculatePvComparison payback", () => {
  it("uses full project cost (module + accessory) for payback", () => {
    const lowAccessory = calculatePvComparison({
      moduleCount: 81,
      mode: "sameCount",
      longi: { ...baseSpec, price: "0.27" },
      competitor: compSpec,
      basicParams: {
        ...DEFAULT_BASIC_PARAMS,
        accessoryCostPerModule: 0.3,
        ppaPrice: 0.15,
      },
      gainStrategies: DEFAULT_GAIN_STRATEGIES,
    });

    const highAccessory = calculatePvComparison({
      moduleCount: 81,
      mode: "sameCount",
      longi: { ...baseSpec, price: "0.27" },
      competitor: compSpec,
      basicParams: {
        ...DEFAULT_BASIC_PARAMS,
        accessoryCostPerModule: 313.49,
        ppaPrice: 0.15,
      },
      gainStrategies: DEFAULT_GAIN_STRATEGIES,
    });

    expect(highAccessory.longiAccessoryCost).toBeCloseTo(81 * 313.49, 0);
    expect(highAccessory.longiProjectCost).toBeGreaterThan(
      lowAccessory.longiProjectCost * 2
    );
    expect(highAccessory.longiPaybackYears).toBeGreaterThan(
      lowAccessory.longiPaybackYears * 1.5
    );
    expect(highAccessory.longiPaybackYears).toBeGreaterThan(3);
    expect(highAccessory.longiPaybackYears).toBeLessThan(
      paybackBeyondHorizonValue(DEFAULT_BASIC_PARAMS.operationYears)
    );
  });

  it("large project with minimal accessory still has multi-year dynamic payback", () => {
    const result = calculatePvComparison({
      moduleCount: 10000,
      mode: "sameCount",
      longi: baseSpec,
      competitor: compSpec,
      basicParams: {
        ...DEFAULT_BASIC_PARAMS,
        accessoryCostPerModule: 0.3,
      },
      gainStrategies: DEFAULT_GAIN_STRATEGIES,
    });

    expect(result.longiPaybackYears).toBeGreaterThan(1);
    expect(result.longiPaybackYears).toBeLessThan(3);
  });

  it("matches user screenshot scenario (1000×475W, 0.127/W, 400/block, PPA 0.4)", () => {
    const result = calculatePvComparison({
      moduleCount: 1000,
      mode: "sameCount",
      longi: {
        power: "475",
        tempCoef: "-0.257",
        firstYearDeg: "1",
        annualDeg: "0.4",
        price: "0.127",
      },
      competitor: {
        power: "475",
        tempCoef: "-0.26",
        firstYearDeg: "1",
        annualDeg: "0.35",
        price: "0.122",
      },
      basicParams: {
        ...DEFAULT_BASIC_PARAMS,
        currency: "USD",
        yearlyEquivalentHours: 1620,
        accessoryCostPerModule: 400,
        ppaPrice: 0.4,
        operationYears: 30,
      },
      gainStrategies: DEFAULT_GAIN_STRATEGIES,
    });

    expect(result.longiAccessoryCost).toBe(400_000);
    expect(result.longiProjectCost).toBeCloseTo(460_325, -2);
    expect(result.longiFirstYearRevenue).toBeGreaterThan(300_000);
    expect(result.longiPaybackYears).toBeGreaterThan(1.2);
    expect(result.longiPaybackYears).toBeLessThan(1.8);
    expect(result.longiStaticPaybackYears).toBeCloseTo(
      result.longiProjectCost / result.longiFirstYearRevenue,
      1
    );
  });

  it("exposes beyond-horizon payback as maxYears + 1", () => {
    const result = calculatePvComparison({
      moduleCount: 10,
      mode: "sameCount",
      longi: baseSpec,
      competitor: compSpec,
      basicParams: {
        ...DEFAULT_BASIC_PARAMS,
        accessoryCostPerModule: 50_000,
        operationYears: 10,
        ppaPrice: 0.01,
      },
      gainStrategies: DEFAULT_GAIN_STRATEGIES,
    });

    expect(result.longiPaybackYears).toBe(11);
  });
});
