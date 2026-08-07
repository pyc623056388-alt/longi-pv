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
  /** Step1 已去掉承重选项；轻质需求用 needs.lightweight，默认常规承重 */
  roofLoad: "normal",
  generation: "any",
  /** Step1 已去掉功率档；由场景自动映射 segment */
  powerPref: "auto",
  needs: {
    antiDust: false,
    antiGlare: false,
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

export function activeNeeds(
  needs: ProductRecommendInput["needs"]
): RecommendFeatureNeed[] {
  return (Object.keys(needs) as RecommendFeatureNeed[]).filter((k) => needs[k]);
}

/** 硬约束：场景/功率/发电类型/承重/已勾选功能必须全部满足 */
export function seriesHardMatches(
  series: ProductSeries,
  input: ProductRecommendInput
): boolean {
  const scenarioSegments = scenarioToSegment(input.scenario);
  if (!scenarioSegments.includes(series.segment)) return false;

  const powerSegments = powerPrefToSegment(input.powerPref);
  if (powerSegments && !powerSegments.includes(series.segment)) return false;

  if (input.generation !== "any" && series.generation !== input.generation) {
    return false;
  }

  if (input.roofLoad === "limited" && !series.features.lightweight) {
    return false;
  }

  for (const need of activeNeeds(input.needs)) {
    if (!series.features[need]) return false;
  }

  return true;
}

export function countMatches(
  input: ProductRecommendInput,
  catalog: ProductSeries[] = PRODUCT_MATRIX
): number {
  return catalog.filter((s) => seriesHardMatches(s, input)).length;
}

export function wouldHaveMatches(
  input: ProductRecommendInput,
  catalog: ProductSeries[] = PRODUCT_MATRIX
): boolean {
  return countMatches(input, catalog) > 0;
}

/** 将局部变更合并进 input，用于探测选项是否可选 */
export function patchRecommendInput(
  input: ProductRecommendInput,
  patch: Partial<{
    scenario: RecommendScenario;
    roofLoad: RecommendRoofLoad;
    generation: ProductGeneration | "any";
    powerPref: RecommendPowerPref;
    needs: Partial<Record<RecommendFeatureNeed, boolean>>;
  }>
): ProductRecommendInput {
  return {
    ...input,
    ...patch,
    needs: patch.needs ? { ...input.needs, ...patch.needs } : input.needs,
  };
}

export function isOptionFeasible(
  input: ProductRecommendInput,
  patch: Parameters<typeof patchRecommendInput>[1],
  catalog: ProductSeries[] = PRODUCT_MATRIX
): boolean {
  return wouldHaveMatches(patchRecommendInput(input, patch), catalog);
}

/**
 * 根据选型表单输入，从产品矩阵中硬过滤后打分排序。
 */
export function recommendProductSeries(
  input: ProductRecommendInput,
  catalog: ProductSeries[] = PRODUCT_MATRIX
): ProductRecommendMatch[] {
  const needIds = activeNeeds(input.needs);
  const matches: ProductRecommendMatch[] = [];

  for (const series of catalog) {
    if (!seriesHardMatches(series, input)) continue;

    let score = 0;
    const reasonsZh: string[] = [];
    const reasonsEn: string[] = [];
    const matchedNeeds: RecommendFeatureNeed[] = [...needIds];
    const missingNeeds: RecommendFeatureNeed[] = [];

    score += 25;
    if (input.powerPref !== "auto") {
      score += 30;
      reasonsZh.push("功率档匹配");
      reasonsEn.push("Power band match");
    } else if (input.scenario === "residential" && series.segment === "residential") {
      score += 8;
    } else if (input.scenario === "commercial" && series.segment === "large") {
      score += 8;
    }

    if (input.generation !== "any") {
      score += 35;
      reasonsZh.push("发电类型匹配");
      reasonsEn.push("Generation type match");
    }

    if (input.roofLoad === "limited") {
      score += 50;
      reasonsZh.push("轻质版型，适合低承重");
      reasonsEn.push("Lightweight for low load-bearing roofs");
    } else if (series.features.lightweight) {
      score -= 8;
    }

    for (const need of needIds) {
      const heavy =
        need === "antiDust" || need === "lightweight" || need === "antiGlare";
      score += heavy ? 40 : 12;
    }

    if (!input.needs.antiDust && series.features.antiDust) score -= 10;
    if (
      !input.needs.lightweight &&
      series.features.lightweight &&
      input.roofLoad !== "limited"
    ) {
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

  return matches.sort(
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

/** 主推以外的弱替代（默认最多 3 个） */
export function weakAlternativeMatches(
  input: ProductRecommendInput,
  catalog?: ProductSeries[],
  limit = 3
): ProductRecommendMatch[] {
  return recommendProductSeries(input, catalog).slice(1, 1 + limit);
}
