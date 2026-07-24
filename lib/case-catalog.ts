/**
 * 项目案例目录（框架）。
 * 媒体最终走 Google Drive fileId；目前可用 localSrc / 产品图占位，网盘链接后期再锁。
 */

import { driveThumbnailUrl } from "./product-drive-resources";
import {
  getProductSeriesById,
  type ProductSeries,
} from "./product-matrix-catalog";

export type CaseMediaType = "photo" | "video";

export interface CaseMedia {
  type: CaseMediaType;
  labelZh: string;
  labelEn: string;
  /** Google Drive file id（后期接入；同 id 换版本即可更新素材） */
  fileId?: string;
  /** 框架占位：站内路径，如 /products/LR7-54HVH.png */
  localSrc?: string;
}

export interface CaseStudy {
  slug: string;
  titleZh: string;
  titleEn: string;
  locationZh: string;
  locationEn: string;
  summaryZh: string;
  summaryEn: string;
  bodyZh: string[];
  bodyEn: string[];
  /** 关联 PRODUCT_MATRIX 系列 id */
  seriesIds: string[];
  coverFileId?: string;
  coverLocalSrc?: string;
  media: CaseMedia[];
  publishedAt: string;
}

/**
 * 示例案例（结构完整，Drive fileId 留空待后续锁定网盘）。
 */
export const CASE_CATALOG: CaseStudy[] = [
  {
    slug: "sydney-residential-hvh",
    titleZh: "悉尼户用屋顶 · 高遮挡场景",
    titleEn: "Sydney residential rooftop · shading",
    locationZh: "澳大利亚 · 悉尼",
    locationEn: "Australia · Sydney",
    summaryZh:
      "户用分布式项目，局部遮挡明显。选用 Hi-MO X10 HVH，兼顾抗热斑与抗遮挡发电表现。",
    summaryEn:
      "Residential DG with partial shading. Hi-MO X10 HVH chosen for anti-hotspot and anti-shading performance.",
    bodyZh: [
      "项目位于悉尼近郊独立住宅，屋面受烟囱与邻栋阴影影响，客户关注局部遮挡下的发电稳定性。",
      "经选型与增益对比，推荐 HVH 户用版型，并保留后续扩展功率档的空间。",
      "本条目为框架示例：照片与视频将在 Google Drive 锁定后替换 fileId。",
    ],
    bodyEn: [
      "Detached home near Sydney with chimney and neighbour shading; stable yield under partial shade was the priority.",
      "After product finding and gain compare, residential HVH was selected with room to step power bands later.",
      "Sample entry for the framework—replace media fileIds once the Drive folder is locked.",
    ],
    seriesIds: ["LR7-54HVH"],
    // 临时用产品矩阵 Drive 产品图占位；后期换成案例文件夹 fileId
    coverFileId: "131nuTwMy4aUlNIBGySFaol19agt6EGAb",
    coverLocalSrc: "/products/LR7-54HVH.png",
    media: [
      {
        type: "photo",
        labelZh: "组件正面（产品图占位）",
        labelEn: "Module front (product photo placeholder)",
        fileId: "131nuTwMy4aUlNIBGySFaol19agt6EGAb",
        localSrc: "/products/LR7-54HVH.png",
      },
      {
        type: "photo",
        labelZh: "组件侧面（产品图占位）",
        labelEn: "Module side (product photo placeholder)",
        fileId: "1MEMDUnPTJMOfcwW4n_fuFskCE4hd4aje",
        localSrc: "/products/LR7-54HVH.png",
      },
      {
        type: "video",
        labelZh: "现场视频（待接入案例 Drive）",
        labelEn: "Site video (case Drive pending)",
      },
    ],
    publishedAt: "2026-03-01",
  },
  {
    slug: "melbourne-ci-hvd",
    titleZh: "墨尔本工商业彩钢瓦屋面",
    titleEn: "Melbourne C&I metal roof",
    locationZh: "澳大利亚 · 墨尔本",
    locationEn: "Australia · Melbourne",
    summaryZh:
      "中大型工商业屋顶，关注温度系数与弱光表现。关联 Hi-MO X10 HVD 系列作案例骨架。",
    summaryEn:
      "Mid/large C&I rooftop focused on temperature coefficient and low-light yield. Skeleton case for Hi-MO X10 HVD.",
    bodyZh: [
      "厂房屋面朝向与倾角已定，客户需要可对外讲解的项目故事页，并一键跳到对应版型资料。",
      "详情页媒体点击仅预览；「查看版型」按钮跳转产品选型站。",
    ],
    bodyEn: [
      "Fixed roof orientation/tilt; the customer needs a shareable project story with a one-click jump to the matching series.",
      "Gallery media opens in-page only; the View series button goes to the product finder.",
    ],
    seriesIds: ["LR7-72HVD"],
    coverFileId: "1Y8pD0CCoLrXgjivG1dqMxDB1_Oaj1oU5",
    coverLocalSrc: "/products/LR7-72HVD.png",
    media: [
      {
        type: "photo",
        labelZh: "组件斜视（产品图占位）",
        labelEn: "Module bevel (product photo placeholder)",
        fileId: "1Y8pD0CCoLrXgjivG1dqMxDB1_Oaj1oU5",
        localSrc: "/products/LR7-72HVD.png",
      },
      {
        type: "video",
        labelZh: "航拍视频（待接入案例 Drive）",
        labelEn: "Aerial video (case Drive pending)",
      },
    ],
    publishedAt: "2026-04-12",
  },
  {
    slug: "brisbane-coastal-hvb",
    titleZh: "布里斯班沿海户用 · 防眩光",
    titleEn: "Brisbane coastal residential · anti-glare",
    locationZh: "澳大利亚 · 布里斯班",
    locationEn: "Australia · Brisbane",
    summaryZh:
      "近海户用场景，客户同时提出防眩光与盐雾相关诉求。框架示例关联 HVB。",
    summaryEn:
      "Coastal home with anti-glare and salt-mist related needs. Framework sample linked to HVB.",
    bodyZh: [
      "用于演示多图文案例结构：封面、正文、画廊与关联版型 CTA。",
      "上传 Drive 后，将 coverFileId / media[].fileId 填入本目录即可，无需改页面代码。",
    ],
    bodyEn: [
      "Demonstrates multi-block case structure: cover, body, gallery, and series CTA.",
      "After Drive is ready, fill coverFileId / media[].fileId in this catalog—no page code changes required.",
    ],
    seriesIds: ["LR7-54HVB"],
    coverFileId: "1gR1nssSuBDjVTboL-B5GcZIPZawRXS3D",
    coverLocalSrc: "/products/LR7-54HVB.png",
    media: [
      {
        type: "photo",
        labelZh: "组件正面（产品图占位）",
        labelEn: "Module front (product photo placeholder)",
        fileId: "1gR1nssSuBDjVTboL-B5GcZIPZawRXS3D",
        localSrc: "/products/LR7-54HVB.png",
      },
      {
        type: "photo",
        labelZh: "组件背面（产品图占位）",
        labelEn: "Module rear (product photo placeholder)",
        fileId: "1WXK7WjT7yb6dYIKY6HbrBn_fDfS5AOMb",
        localSrc: "/products/LR7-54HVB.png",
      },
    ],
    publishedAt: "2026-05-20",
  },
];

export function listCaseStudies(): CaseStudy[] {
  return [...CASE_CATALOG].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );
}

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return CASE_CATALOG.find((c) => c.slug === slug);
}

export function caseCoverSrc(caseStudy: CaseStudy, size = 1200): string | null {
  if (caseStudy.coverFileId) {
    return driveThumbnailUrl(caseStudy.coverFileId, size);
  }
  return caseStudy.coverLocalSrc ?? null;
}

export function caseMediaThumbSrc(
  media: CaseMedia,
  size = 800
): string | null {
  if (media.fileId) return driveThumbnailUrl(media.fileId, size);
  if (media.type === "photo") return media.localSrc ?? null;
  return null;
}

/** Drive 内嵌预览（视频 / 大图）；无 fileId 时返回 null */
export function caseDrivePreviewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/preview`;
}

export function caseLinkedSeries(caseStudy: CaseStudy): ProductSeries[] {
  return caseStudy.seriesIds
    .map((id) => getProductSeriesById(id))
    .filter((s): s is ProductSeries => Boolean(s));
}

export function recommendHrefForSeries(seriesId: string): string {
  return `/recommend?series=${encodeURIComponent(seriesId)}`;
}
