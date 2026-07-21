import {
  PRODUCT_MATRIX,
  type ProductGeneration,
  type ProductSegmentBand,
  type ProductSeries,
  type ProductSeriesFeatures,
} from "./product-matrix-catalog";

export type RecommendScenario = "residential" | "commercial" | "flexible";
export type RecommendRoofLoad = "normal" | "limited";
export type RecommendPowerPref = "auto" | "residential" | "medium" | "large";

export type RecommendFeatureNeed = keyof ProductSeriesFeatures;

export interface ProductRecommendInput {
  scenario: RecommendScenario;
  roofLoad: RecommendRoofLoad;
  generation: ProductGeneration | "any";
  powerPref: RecommendPowerPref;
  needs: Partial<Record<RecommendFeatureNeed, boolean>>;
}

export const DEFAULT_PRODUCT_RECOMMEND_INPUT: ProductRecommendInput = {
  scenario: "residential",
  roofLoad: "normal",
  generation: "any",
  powerPref: "auto",
  needs: {
    antiHotspot: true,
    antiDust: false,
    antiGlare: false,
    antiShading: true,
    lightweight: false,
    saltMist: false,
    ammonia: false,
    hail: false,
  },
};

export interface ProductRecommendMatch {
  series: ProductSeries;
  score: number;
  matchedNeeds: RecommendFeatureNeed[];
  missingNeeds: RecommendFeatureNeed[];
  reasonsZh: string[];
  reasonsEn: string[];
}

function scenarioToSegment(scenario: RecommendScenario): ProductSegmentBand[] {
  if (scenario === "residential") return ["residential", "medium"];
  if (scenario === "commercial") return ["medium", "large"];
  return ["residential", "medium", "large"];
}

function powerPrefToSegment(
  pref: RecommendPowerPref
): ProductSegmentBand[] | null {
  if (pref === "auto") return null;
  return [pref];
}

function activeNeeds(
  needs: ProductRecommendInput["needs"]
): RecommendFeatureNeed[] {
  return (Object.keys(needs) as RecommendFeatureNeed[]).filter((k) => needs[k]);
}

/**
 * 根据选型表单输入，从产品矩阵中打分并排序推荐系列。
 */
export function recommendProductSeries(
  input: ProductRecommendInput,
  catalog: ProductSeries[] = PRODUCT_MATRIX
): ProductRecommendMatch[] {
  const needIds = activeNeeds(input.needs);
  const scenarioSegments = scenarioToSegment(input.scenario);
  const powerSegments = powerPrefToSegment(input.powerPref);

  const matches: ProductRecommendMatch[] = [];

  for (const series of catalog) {
    let score = 0;
    const reasonsZh: string[] = [];
    const reasonsEn: string[] = [];
    const matchedNeeds: RecommendFeatureNeed[] = [];
    const missingNeeds: RecommendFeatureNeed[] = [];

    // 场景 / 功率档
    const inScenario = scenarioSegments.includes(series.segment);
    if (inScenario) {
      score += 25;
    } else {
      score -= 35;
    }

    if (powerSegments) {
      if (powerSegments.includes(series.segment)) {
        score += 30;
        reasonsZh.push("功率档匹配");
        reasonsEn.push("Power band match");
      } else {
        score -= 40;
      }
    } else if (input.scenario === "residential" && series.segment === "residential") {
      score += 8;
    } else if (input.scenario === "commercial" && series.segment === "large") {
      score += 8;
    }

    // 发电类型
    if (input.generation !== "any") {
      if (series.generation === input.generation) {
        score += 35;
        reasonsZh.push("发电类型匹配");
        reasonsEn.push("Generation type match");
      } else {
        score -= 45;
      }
    }

    // 屋顶承重
    if (input.roofLoad === "limited") {
      if (series.features.lightweight) {
        score += 50;
        reasonsZh.push("轻质版型，适合低承重");
        reasonsEn.push("Lightweight for low load-bearing roofs");
      } else {
        score -= 55;
      }
    } else if (series.features.lightweight) {
      score -= 8;
    }

    // 功能需求
    for (const need of needIds) {
      if (series.features[need]) {
        matchedNeeds.push(need);
        const heavy = need === "antiDust" || need === "lightweight" || need === "antiGlare";
        score += heavy ? 40 : 12;
      } else {
        missingNeeds.push(need);
        const heavy = need === "antiDust" || need === "lightweight" || need === "antiGlare";
        score -= heavy ? 48 : 10;
      }
    }

    // 未勾选防积灰时，略微偏好非 F
    if (!input.needs.antiDust && series.features.antiDust) score -= 10;
    if (!input.needs.lightweight && series.features.lightweight && input.roofLoad !== "limited") {
      score -= 6;
    }

    if (matchedNeeds.includes("antiDust")) {
      reasonsZh.push("防积灰版型");
      reasonsEn.push("Anti-dust variant");
    }
    if (matchedNeeds.includes("antiGlare")) {
      reasonsZh.push("具备防眩光能力");
      reasonsEn.push("Anti-glare capable");
    }
    if (matchedNeeds.includes("antiHotspot")) {
      reasonsZh.push("抗热斑 / 防起火");
      reasonsEn.push("Anti-hotspot / fire prevention");
    }

    matches.push({
      series,
      score,
      matchedNeeds,
      missingNeeds,
      reasonsZh,
      reasonsEn,
    });
  }

  return matches
    .filter((m) => m.score > -20)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.series.modelFamily.localeCompare(b.series.modelFamily)
    );
}

export function topProductRecommendation(
  input: ProductRecommendInput,
  catalog?: ProductSeries[]
): ProductRecommendMatch | undefined {
  return recommendProductSeries(input, catalog)[0];
}
