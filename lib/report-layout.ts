/** A4 @ 96dpi — fixed page shell for per-page PDF capture */

export const REPORT_PAGE_WIDTH_PX = 794;
export const REPORT_PAGE_HEIGHT_PX = 1123;

export const REPORT_PAGE_PADDING_TOP_PX = 32;
export const REPORT_PAGE_PADDING_BOTTOM_PX = 56;
export const REPORT_PAGE_PADDING_X_PX = 40;

/** Space between stacked blocks inside a page */
export const REPORT_BLOCK_GAP_PX = 16;

export const REPORT_CONTENT_MAX_HEIGHT_PX =
  REPORT_PAGE_HEIGHT_PX -
  REPORT_PAGE_PADDING_TOP_PX -
  REPORT_PAGE_PADDING_BOTTOM_PX;

export const METRICS_HEAD_BLOCK_ID = "metrics-head";
export const METRICS_TITLE_BLOCK_ID = "metrics-title";

export function metricsRowBlockId(index: number): string {
  return `metrics-row-${index}`;
}

export function isMetricsRowBlockId(id: string): boolean {
  return id.startsWith("metrics-row-");
}

/** Ordered block ids for measure + paginate */
export function getReportBlockIds(rowCount: number): string[] {
  return [
    "header",
    "project",
    "basic-params",
    "modules",
    "gain-strategies",
    "highlights",
    "charts",
    METRICS_TITLE_BLOCK_ID,
    METRICS_HEAD_BLOCK_ID,
    ...Array.from({ length: rowCount }, (_, i) => metricsRowBlockId(i)),
    "footer",
  ];
}
