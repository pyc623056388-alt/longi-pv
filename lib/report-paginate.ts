import {
  isMetricsRowBlockId,
  METRICS_HEAD_BLOCK_ID,
  METRICS_TITLE_BLOCK_ID,
  metricsRowBlockId,
  REPORT_BLOCK_GAP_PX,
} from "./report-layout";

export interface MeasuredBlock {
  id: string;
  height: number;
}

export interface ReportPagePlan {
  blockIds: string[];
}

function estimateMinMetricsSectionStart(
  heightById: Map<string, number>,
  blockGap: number,
  headHeight: number
): number {
  const titleH = heightById.get(METRICS_TITLE_BLOCK_ID) ?? 24;
  let rowsH = 0;
  let rowCount = 0;
  for (let i = 0; rowCount < 2; i++) {
    const rh = heightById.get(metricsRowBlockId(i));
    if (rh == null) break;
    rowsH += rh;
    rowCount++;
  }
  const gaps = rowCount > 0 ? blockGap * 2 : blockGap;
  return titleH + headHeight + rowsH + gaps;
}

/**
 * Pack blocks into pages. Never splits a block. Repeats table header when
 * metric rows continue on a new page.
 */
export function paginateReportBlocks(
  blocks: MeasuredBlock[],
  maxContentHeight: number,
  blockGap = REPORT_BLOCK_GAP_PX
): ReportPagePlan[] {
  const heightById = new Map(blocks.map((b) => [b.id, b.height]));
  const headHeight = heightById.get(METRICS_HEAD_BLOCK_ID) ?? 0;
  const minMetricsStart = estimateMinMetricsSectionStart(
    heightById,
    blockGap,
    headHeight
  );

  const pages: ReportPagePlan[] = [];
  let current: string[] = [];
  let used = 0;

  const flush = () => {
    if (current.length > 0) {
      pages.push({ blockIds: [...current] });
      current = [];
      used = 0;
    }
  };

  const ensureMetricsHead = (blockId: string) => {
    if (current.includes(METRICS_HEAD_BLOCK_ID)) return 0;
    if (!isMetricsRowBlockId(blockId)) return 0;
    current.push(METRICS_HEAD_BLOCK_ID);
    used += headHeight + (current.length > 1 ? blockGap : 0);
    return headHeight;
  };

  for (const block of blocks) {
    const h = heightById.get(block.id) ?? 0;
    let extra = 0;

    if (block.id === METRICS_TITLE_BLOCK_ID && current.length > 0) {
      const gap = blockGap;
      const shouldStartNewPage =
        used + gap + minMetricsStart > maxContentHeight ||
        current.some(
          (id) =>
            id === "highlights" ||
            id === "charts" ||
            id === "gain-strategies"
        );
      if (shouldStartNewPage) {
        flush();
      }
    }

    if (isMetricsRowBlockId(block.id)) {
      extra = ensureMetricsHead(block.id);
    }

    const gap = current.length > 0 ? blockGap : 0;
    if (used + extra + gap + h > maxContentHeight && current.length > 0) {
      flush();
      if (isMetricsRowBlockId(block.id)) {
        ensureMetricsHead(block.id);
      }
    }

    if (current.length > 0) used += blockGap;
    current.push(block.id);
    used += h;
  }

  flush();
  return pages.length > 0 ? pages : [{ blockIds: blocks.map((b) => b.id) }];
}
