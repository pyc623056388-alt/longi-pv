/**
 * 项目案例目录。
 * 视频：YouTube videoId（一案例一视频）；照片：可选 Google Drive fileId / localSrc。
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
  /** YouTube 视频 id（站内 iframe 播放） */
  youtubeVideoId?: string;
  /** Google Drive file id（照片或备用视频） */
  fileId?: string;
  /** 站内路径占位，如 /products/LR7-54HVH.png */
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
  /** 主视频（封面优先用其 YouTube 缩略图） */
  youtubeVideoId?: string;
  coverFileId?: string;
  coverLocalSrc?: string;
  media: CaseMedia[];
  publishedAt: string;
}

export function youtubeThumbUrl(videoId: string, quality: "hq" | "mq" | "sd" = "hq"): string {
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/${quality}default.jpg`;
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`;
}

/**
 * Longi-Case 播放列表（https://www.youtube.com/playlist?list=PLZ5M08taeKFs）
 * 一案例一视频；版型按户用/工商业场景初设，可随时改 seriesIds。
 */
export const CASE_CATALOG: CaseStudy[] = [
  {
    slug: "harbour-grounds-office",
    titleZh: "Harbour Grounds 办公站点太阳能",
    titleEn: "Harbour Grounds Office Sites Now Powered by Solar",
    locationZh: "新西兰 · 奥克兰",
    locationEn: "New Zealand · Auckland",
    summaryZh:
      "办公站点工商业屋顶改造，展示隆基组件在商业场地上的落地效果。",
    summaryEn:
      "Commercial office rooftop solar rollout showcasing LONGi modules on business sites.",
    bodyZh: [
      "本案例来自 Longi-Case 播放列表现场视频，适合向客户讲解工商业分布式场景。",
      "详情页可站内播放项目视频；「查看版型」进入产品选型查看关联系列。",
    ],
    bodyEn: [
      "Sourced from the Longi-Case playlist—useful when walking customers through a C&I rooftop story.",
      "Play the project video in-page; use View series to open the linked product finder series.",
    ],
    seriesIds: ["LR7-72HVD"],
    youtubeVideoId: "21F3Vf8owgQ",
    media: [
      {
        type: "video",
        labelZh: "项目视频",
        labelEn: "Project video",
        youtubeVideoId: "21F3Vf8owgQ",
      },
    ],
    publishedAt: "2026-07-01",
  },
  {
    slug: "kfc-east-tamaki",
    titleZh: "KFC East Tāmaki 工商业装机",
    titleEn: "KFC East Tāmaki Goes Solar · 42 Panel Commercial Installation",
    locationZh: "新西兰 · 奥克兰 East Tāmaki",
    locationEn: "New Zealand · East Tāmaki, Auckland",
    summaryZh: "快餐门店屋顶约 42 块组件的工商业安装案例。",
    summaryEn:
      "Commercial install of about 42 panels on a quick-service restaurant rooftop.",
    bodyZh: [
      "典型小型工商业屋顶，便于讲解装机规模、工期与品牌门店场景。",
      "视频站内播放；关联中版型 HVH，可按实际项目再调整系列。",
    ],
    bodyEn: [
      "A compact C&I rooftop story—good for install scale, schedule, and branded retail sites.",
      "Video plays in-page; linked to mid-size HVH and adjustable in the catalog.",
    ],
    seriesIds: ["LR7-60HVH"],
    youtubeVideoId: "LCTZaLjCIFU",
    media: [
      {
        type: "video",
        labelZh: "项目视频",
        labelEn: "Project video",
        youtubeVideoId: "LCTZaLjCIFU",
      },
    ],
    publishedAt: "2026-06-20",
  },
  {
    slug: "ponsonby-residential",
    titleZh: "Ponsonby 户用屋顶安装",
    titleEn: "Ponsonby Residential Solar Install",
    locationZh: "新西兰 · 奥克兰 Ponsonby",
    locationEn: "New Zealand · Ponsonby, Auckland",
    summaryZh: "市区户用屋顶安装案例，适合讲解住宅分布式选型。",
    summaryEn:
      "Urban residential rooftop install—useful for home DG product conversations.",
    bodyZh: [
      "户用场景示例：从案例视频切入，再跳转 HVH 户用版型资料与增益对比。",
    ],
    bodyEn: [
      "Residential sample: start from the case video, then jump to HVH residential materials and gain compare.",
    ],
    seriesIds: ["LR7-54HVH"],
    youtubeVideoId: "21GHXk1eeBo",
    media: [
      {
        type: "video",
        labelZh: "项目视频",
        labelEn: "Project video",
        youtubeVideoId: "21GHXk1eeBo",
      },
    ],
    publishedAt: "2026-06-10",
  },
  {
    slug: "titirangi-golf-club",
    titleZh: "Titirangi 高尔夫俱乐部电气化项目",
    titleEn: "Titirangi Golf Club Electrification Project",
    locationZh: "新西兰 · Titirangi",
    locationEn: "New Zealand · Titirangi",
    summaryZh: "俱乐部场馆电气化配套光伏项目，偏工商业应用。",
    summaryEn:
      "Clubhouse electrification with rooftop solar—commercial / institutional use case.",
    bodyZh: [
      "适合讲解文体/俱乐部类工商业客户的装机故事与版型推荐路径。",
    ],
    bodyEn: [
      "Useful for sports / club C&I conversations and the path into series recommendation.",
    ],
    seriesIds: ["LR7-72HVD"],
    youtubeVideoId: "9y0_ACQYumM",
    media: [
      {
        type: "video",
        labelZh: "项目视频",
        labelEn: "Project video",
        youtubeVideoId: "9y0_ACQYumM",
      },
    ],
    publishedAt: "2026-05-28",
  },
  {
    slug: "world-vision-hq-auckland",
    titleZh: "World Vision 奥克兰总部太阳能安装",
    titleEn: "Solar Installation World Vision HQ Auckland",
    locationZh: "新西兰 · 奥克兰",
    locationEn: "New Zealand · Auckland",
    summaryZh: "机构总部屋顶光伏安装，展示公共/非营利机构场景。",
    summaryEn:
      "HQ rooftop solar for an institutional / non-profit headquarters.",
    bodyZh: [
      "机构客户案例：视频讲故事，按钮进入对应工商业版型选型。",
    ],
    bodyEn: [
      "Institutional customer story: video for narrative, CTA into the C&I series finder.",
    ],
    seriesIds: ["LR7-72HVD"],
    youtubeVideoId: "Xz64GK0wB7Y",
    media: [
      {
        type: "video",
        labelZh: "项目视频",
        labelEn: "Project video",
        youtubeVideoId: "Xz64GK0wB7Y",
      },
    ],
    publishedAt: "2026-05-15",
  },
  {
    slug: "glenmore-park-high-school",
    titleZh: "Glenmore Park 高中 87.36 kW 工商业装机",
    titleEn:
      "87.36 kW Commercial Solar Installation at Glenmore Park High School NSW",
    locationZh: "澳大利亚 · 新南威尔士 Glenmore Park",
    locationEn: "Australia · Glenmore Park, NSW",
    summaryZh: "学校屋顶约 87.36 kW 工商业装机案例。",
    summaryEn:
      "School rooftop commercial install around 87.36 kW in NSW.",
    bodyZh: [
      "教育类工商业项目，便于讲解装机容量与校园屋顶场景。",
    ],
    bodyEn: [
      "Education-sector C&I project—good for capacity talk tracks and campus rooftops.",
    ],
    seriesIds: ["LR7-72HVD"],
    youtubeVideoId: "ybnpWjR3kpg",
    media: [
      {
        type: "video",
        labelZh: "项目视频",
        labelEn: "Project video",
        youtubeVideoId: "ybnpWjR3kpg",
      },
    ],
    publishedAt: "2026-04-30",
  },
  {
    slug: "james-treble-home",
    titleZh: "James Treble 户用改造 · LONGi 组件",
    titleEn:
      "Energy Matters TV Ep 5 · James Treble's Transformed Home with LONGi Solar Panels",
    locationZh: "澳大利亚",
    locationEn: "Australia",
    summaryZh: "媒体节目中的户用改造故事，突出 LONGi 组件应用。",
    summaryEn:
      "Media feature on a transformed home using LONGi solar panels.",
    bodyZh: [
      "户用故事型案例，适合经销商对终端客户做感性讲解后再进入选型。",
    ],
    bodyEn: [
      "Residential storytelling case—useful before moving customers into product selection.",
    ],
    seriesIds: ["LR7-54HVH"],
    youtubeVideoId: "5GSfdCgNk9Q",
    media: [
      {
        type: "video",
        labelZh: "项目视频",
        labelEn: "Project video",
        youtubeVideoId: "5GSfdCgNk9Q",
      },
    ],
    publishedAt: "2026-04-12",
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
  if (caseStudy.youtubeVideoId) {
    return youtubeThumbUrl(caseStudy.youtubeVideoId, "hq");
  }
  if (caseStudy.coverFileId) {
    return driveThumbnailUrl(caseStudy.coverFileId, size);
  }
  return caseStudy.coverLocalSrc ?? null;
}

export function caseMediaThumbSrc(
  media: CaseMedia,
  size = 800
): string | null {
  if (media.youtubeVideoId) return youtubeThumbUrl(media.youtubeVideoId, "hq");
  if (media.fileId) return driveThumbnailUrl(media.fileId, size);
  if (media.type === "photo") return media.localSrc ?? null;
  return null;
}

/** Drive 内嵌预览（照片 / 备用视频） */
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
