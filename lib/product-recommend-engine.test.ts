import { describe, expect, it } from "vitest";
import {
  DEFAULT_PRODUCT_RECOMMEND_INPUT,
  recommendProductSeries,
  topProductRecommendation,
} from "./product-recommend-engine";

describe("product-recommend-engine", () => {
  it("recommends anti-dust residential HVHF when antiDust is required", () => {
    const top = topProductRecommendation({
      ...DEFAULT_PRODUCT_RECOMMEND_INPUT,
      scenario: "residential",
      powerPref: "residential",
      needs: {
        ...DEFAULT_PRODUCT_RECOMMEND_INPUT.needs,
        antiDust: true,
      },
    });
    expect(top?.series.id).toBe("LR7-54HVHF");
  });

  it("recommends HVHL when roof load is limited", () => {
    const top = topProductRecommendation({
      ...DEFAULT_PRODUCT_RECOMMEND_INPUT,
      scenario: "commercial",
      roofLoad: "limited",
      powerPref: "medium",
      needs: { ...DEFAULT_PRODUCT_RECOMMEND_INPUT.needs, lightweight: true },
    });
    expect(top?.series.id).toBe("LR7-60HVHL");
  });

  it("recommends transparent bifacial when generation is transparent", () => {
    const top = topProductRecommendation({
      ...DEFAULT_PRODUCT_RECOMMEND_INPUT,
      generation: "transparent",
      powerPref: "residential",
    });
    expect(top?.series.id).toBe("LR7-54HVDT");
  });

  it("ranks large bifacial for commercial + large power", () => {
    const list = recommendProductSeries({
      scenario: "commercial",
      roofLoad: "normal",
      generation: "bifacial",
      powerPref: "large",
      needs: {
        antiHotspot: true,
        antiShading: true,
        antiGlare: true,
      },
    });
    expect(list[0]?.series.id).toBe("LR7-72HVD");
  });
});
