/**
 * 场景化产品矩阵（来源：Google Drive「03-场景化矩阵 / Scenario matrix」构建报告
 * Scenario -> Grade -> Model）。用于「产品展示」页按场景分级浏览。
 *
 * 规则：
 * - 型号别名：LR7-54HVDT 归并为 LR7-54HVD；LR7-72HVDA 不在 PRODUCT_MATRIX，解析时被过滤。
 * - Grade 层：key === "_base" 视为「无 Grade」，直接展示型号；其余命名 Grade 保留为分组。
 * - hidden 的场景（Agri-Ammonia / Marine / Fire-ClassA）暂不在前台展示，数据保留以后启用。
 */

import {
  getProductSeriesById,
  type ProductSeries,
} from "./product-matrix-catalog";

export type ScenarioId =
  | "standard"
  | "lightweight"
  | "premium-allblack"
  | "antiglare"
  | "antidust"
  | "hail"
  | "highwind"
  | "agri-ammonia"
  | "marine"
  | "fire-classa";

export interface ScenarioGrade {
  /** Drive 中的 Grade 目录名；"_base" 表示无实际 Grade */
  key: string;
  labelZh: string;
  labelEn: string;
  /** Drive 原始型号 id（解析时做别名归并 + 过滤未知） */
  modelIds: string[];
}

export interface ProductScenario {
  id: ScenarioId;
  nameZh: string;
  nameEn: string;
  taglineZh: string;
  taglineEn: string;
  /** 暂时隐藏（数据保留） */
  hidden: boolean;
  /** 着陆页整宽大卡（Standard） */
  featured: boolean;
  /** 卡片/详情代表产品，用于回退取图 */
  heroSeriesId: string;
  /** 场景引导图（着陆页卡片背景） */
  tileImage: string;
  grades: ScenarioGrade[];
}

const NO_GRADE_KEY = "_base";

/** 型号别名：Drive 型号 → PRODUCT_MATRIX 系列 id */
const MODEL_ID_ALIASES: Record<string, string> = {
  "LR7-54HVDT": "LR7-54HVD",
};

const ANTIDUST_MODELS = [
  "LR7-54HVB",
  "LR7-54HVDT",
  "LR7-54HVH",
  "LR7-54HVHF",
  "LR7-60HVD",
  "LR7-60HVH",
  "LR7-60HVHL",
  "LR7-72HVD",
  "LR7-72HVDF",
  "LR7-72HVH",
  "LR7-72HVHF",
  "LR8-66HVD",
  "LR8-66HVDF",
  "LR8-66HYD",
];

export const PRODUCT_SCENARIOS: ProductScenario[] = [
  {
    id: "standard",
    nameZh: "标准场景",
    nameEn: "Standard",
    taglineZh: "通用户用与工商业屋顶的主力版型",
    taglineEn: "Core lineup for typical residential & C&I rooftops",
    hidden: false,
    featured: true,
    heroSeriesId: "LR7-72HVD",
    tileImage: "/products/scenarios/standard.png",
    grades: [
      {
        key: NO_GRADE_KEY,
        labelZh: "",
        labelEn: "",
        modelIds: [
          "LR7-54HVDT",
          "LR7-54HVH",
          "LR7-60HVD",
          "LR7-60HVH",
          "LR7-72HVD",
          "LR7-72HVH",
        ],
      },
    ],
  },
  {
    id: "lightweight",
    nameZh: "轻质场景",
    nameEn: "Lightweight",
    taglineZh: "低承重屋面的轻量化版型",
    taglineEn: "Lightweight modules for low load-bearing roofs",
    hidden: false,
    featured: false,
    heroSeriesId: "LR7-60HVHL",
    tileImage: "/products/scenarios/lightweight.png",
    grades: [
      {
        key: NO_GRADE_KEY,
        labelZh: "",
        labelEn: "",
        modelIds: ["LR7-60HVHL"],
      },
    ],
  },
  {
    id: "premium-allblack",
    nameZh: "高端全黑",
    nameEn: "Premium All-Black",
    taglineZh: "纯黑高级美学，适配高端住宅",
    taglineEn: "All-black premium aesthetics for premium homes",
    hidden: false,
    featured: false,
    heroSeriesId: "LR7-54HVB",
    tileImage: "/products/scenarios/premium-allblack.png",
    grades: [
      {
        key: NO_GRADE_KEY,
        labelZh: "",
        labelEn: "",
        modelIds: ["LR7-54HVB"],
      },
    ],
  },
  {
    id: "antiglare",
    nameZh: "防眩光",
    nameEn: "Anti-Glare",
    taglineZh: "哑光低反射，适配机场、道路周边",
    taglineEn: "Low-reflection matte surface for airports & roadsides",
    hidden: false,
    featured: false,
    heroSeriesId: "LR7-72HVD",
    tileImage: "/products/scenarios/antiglare.png",
    grades: [
      {
        key: "1.0",
        labelZh: "防眩光 1.0",
        labelEn: "Anti-Glare 1.0",
        modelIds: ["LR7-54HVH", "LR7-72HVD", "LR7-72HVH", "LR8-66HVD"],
      },
      {
        key: "2.0",
        labelZh: "防眩光 2.0",
        labelEn: "Anti-Glare 2.0",
        modelIds: ["LR7-54HVB", "LR7-54HVH", "LR8-66HVD"],
      },
    ],
  },
  {
    id: "antidust",
    nameZh: "防积灰",
    nameEn: "Anti-Dust",
    taglineZh: "抗积灰认证，降低清洗频次",
    taglineEn: "Anti-dust certified, less cleaning",
    hidden: false,
    featured: false,
    heroSeriesId: "LR7-72HVD",
    tileImage: "/products/scenarios/antidust.png",
    grades: [
      {
        key: "Certified",
        labelZh: "防积灰认证",
        labelEn: "Dust & Sand Certified",
        modelIds: ANTIDUST_MODELS,
      },
    ],
  },
  {
    id: "hail",
    nameZh: "抗冰雹",
    nameEn: "Hail",
    taglineZh: "增强抗冰雹能力，覆盖多档冲击等级",
    taglineEn: "Enhanced hail resistance across impact grades",
    hidden: false,
    featured: false,
    heroSeriesId: "LR8-66HYD",
    tileImage: "/products/scenarios/hail.png",
    grades: [
      {
        key: "HI35+45",
        labelZh: "35+45mm 冰雹",
        labelEn: "35+45 mm hail",
        modelIds: ["LR7-54HVB", "LR7-54HVH", "LR7-72HVDF", "LR7-72HVHF"],
      },
      {
        key: "HI45_Glass2.8+2",
        labelZh: "45mm · 玻璃 2.8+2",
        labelEn: "45 mm · Glass 2.8+2",
        modelIds: ["LR8-66HYD"],
      },
      {
        key: "HI55_Angle30_Glass2.8+2",
        labelZh: "55mm · 30° · 玻璃 2.8+2",
        labelEn: "55 mm · 30° · Glass 2.8+2",
        modelIds: ["LR8-66HYD"],
      },
      {
        key: "HI55_Angle30_Glass3.2+2",
        labelZh: "55mm · 30° · 玻璃 3.2+2",
        labelEn: "55 mm · 30° · Glass 3.2+2",
        modelIds: ["LR8-66HYD"],
      },
      {
        key: "HI65_Angle60_Glass2.8+2",
        labelZh: "65mm · 60° · 玻璃 2.8+2",
        labelEn: "65 mm · 60° · Glass 2.8+2",
        modelIds: ["LR8-66HYD"],
      },
      {
        key: "HW4_Glass3.2+2",
        labelZh: "HW4 · 玻璃 3.2+2",
        labelEn: "HW4 · Glass 3.2+2",
        modelIds: ["LR8-66HYD"],
      },
    ],
  },
  {
    id: "highwind",
    nameZh: "抗强风",
    nameEn: "High Wind",
    taglineZh: "高风压场景，Albright 风洞验证",
    taglineEn: "High wind loads, Albright wind-tunnel verified",
    hidden: false,
    featured: false,
    heroSeriesId: "LR7-54HVH",
    tileImage: "/products/scenarios/highwind.png",
    grades: [
      {
        key: "Albright",
        labelZh: "Albright 风洞",
        labelEn: "Albright wind tunnel",
        modelIds: ["LR7-54HVH"],
      },
    ],
  },
  {
    id: "agri-ammonia",
    nameZh: "农牧防氨",
    nameEn: "Agri / Ammonia",
    taglineZh: "农牧氨气环境认证",
    taglineEn: "Ammonia-resistance certified for agriculture",
    hidden: true,
    featured: false,
    heroSeriesId: "LR7-72HVD",
    tileImage: "/products/scenarios/agri-ammonia.png",
    grades: [
      {
        key: "Certified",
        labelZh: "防氨认证",
        labelEn: "Ammonia Certified",
        modelIds: ANTIDUST_MODELS,
      },
    ],
  },
  {
    id: "marine",
    nameZh: "海洋盐雾",
    nameEn: "Marine",
    taglineZh: "沿海高盐雾环境版型",
    taglineEn: "For coastal high salt-mist environments",
    hidden: true,
    featured: false,
    heroSeriesId: "LR8-66HYD",
    tileImage: "/products/scenarios/marine.png",
    grades: [
      {
        key: "SaltMist-L8",
        labelZh: "盐雾 L8",
        labelEn: "Salt Mist L8",
        modelIds: ["LR8-66HYD"],
      },
    ],
  },
  {
    id: "fire-classa",
    nameZh: "A 级防火",
    nameEn: "Fire Class A",
    taglineZh: "A 级防火认证场景",
    taglineEn: "Class A fire-rated scenario",
    hidden: true,
    featured: false,
    heroSeriesId: "LR8-66HYD",
    tileImage: "/products/scenarios/fire-classa.png",
    grades: [
      {
        key: "ClassA",
        labelZh: "A 级防火",
        labelEn: "Class A fire",
        modelIds: ["LR7-72HVDA", "LR8-66HYD"],
      },
    ],
  },
];

export interface ScenarioGradeGroup {
  key: string;
  labelZh: string;
  labelEn: string;
  series: ProductSeries[];
}

export function normalizeModelId(id: string): string {
  return MODEL_ID_ALIASES[id] ?? id;
}

/** 归并别名 + 过滤 PRODUCT_MATRIX 不存在的型号 + 去重，解析为系列对象 */
export function resolveModelIds(ids: string[]): ProductSeries[] {
  const seen = new Set<string>();
  const out: ProductSeries[] = [];
  for (const raw of ids) {
    const series = getProductSeriesById(normalizeModelId(raw));
    if (!series || seen.has(series.id)) continue;
    seen.add(series.id);
    out.push(series);
  }
  return out;
}

export function listScenarios(): ProductScenario[] {
  return PRODUCT_SCENARIOS;
}

export function listVisibleScenarios(): ProductScenario[] {
  return PRODUCT_SCENARIOS.filter((s) => !s.hidden);
}

export function getScenarioById(id: string): ProductScenario | undefined {
  return PRODUCT_SCENARIOS.find((s) => s.id === id);
}

/** 是否展示 Grade 分组层（只有单一 _base 时不展示） */
export function scenarioHasGrades(scenario: ProductScenario): boolean {
  return !(
    scenario.grades.length === 1 && scenario.grades[0].key === NO_GRADE_KEY
  );
}

/** 场景下全部产品（跨 Grade 去重），用于无 Grade 网格与数量统计 */
export function scenarioFlatSeries(scenario: ProductScenario): ProductSeries[] {
  return resolveModelIds(scenario.grades.flatMap((g) => g.modelIds));
}

/** 场景下按 Grade 分组解析后的产品；过滤掉无有效产品的分组 */
export function scenarioGradeGroups(
  scenario: ProductScenario
): ScenarioGradeGroup[] {
  return scenario.grades
    .map((g) => ({
      key: g.key,
      labelZh: g.labelZh,
      labelEn: g.labelEn,
      series: resolveModelIds(g.modelIds),
    }))
    .filter((g) => g.series.length > 0);
}

export function scenarioProductCount(scenario: ProductScenario): number {
  return scenarioFlatSeries(scenario).length;
}

/** 某系列是否属于该场景（用于详情页校验路由合法性） */
export function scenarioIncludesSeries(
  scenario: ProductScenario,
  seriesId: string
): boolean {
  return scenarioFlatSeries(scenario).some((s) => s.id === seriesId);
}
