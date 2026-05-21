import { describe, expect, it } from "vitest";
import { convertBasicParams, convertMoney } from "./currency";
import { DEFAULT_BASIC_PARAMS } from "./pv-types";

describe("convertMoney", () => {
  it("returns same amount when from equals to", () => {
    expect(convertMoney(0.95, "AUD", "AUD", "pricePerW")).toBe(0.95);
  });

  it("converts AUD to USD with rounding", () => {
    expect(convertMoney(1, "AUD", "USD", "cost")).toBe(0.66);
    expect(convertMoney(0.15, "AUD", "USD", "ppa")).toBe(0.099);
  });

  it("round-trips AUD via USD approximately", () => {
    const usd = convertMoney(100, "AUD", "USD", "cost");
    const back = convertMoney(usd, "USD", "AUD", "cost");
    expect(back).toBeCloseTo(100, 0);
  });
});

describe("convertBasicParams", () => {
  it("updates currency and converts monetary fields", () => {
    const next = convertBasicParams(DEFAULT_BASIC_PARAMS, "CNY");
    expect(next.currency).toBe("CNY");
    expect(next.ppaPrice).toBe(convertMoney(0.15, "AUD", "CNY", "ppa"));
    expect(next.accessoryCostPerModule).toBe(
      convertMoney(0.3, "AUD", "CNY", "cost")
    );
  });
});
