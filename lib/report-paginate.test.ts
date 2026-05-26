import { describe, expect, it } from "vitest";
import { paginateReportBlocks } from "./report-paginate";

describe("paginateReportBlocks", () => {
  it("keeps blocks intact and repeats metrics head on continuation page", () => {
    const blocks = [
      { id: "header", height: 80 },
      { id: "metrics-title", height: 24 },
      { id: "metrics-head", height: 32 },
      { id: "metrics-row-0", height: 28 },
      { id: "metrics-row-1", height: 28 },
      { id: "metrics-row-2", height: 28 },
      { id: "footer", height: 40 },
    ];

    const pages = paginateReportBlocks(blocks, 120, 0);

    expect(pages.length).toBeGreaterThan(1);
    const lastWithRows = pages.find((p) =>
      p.blockIds.some((id) => id.startsWith("metrics-row-"))
    );
    expect(lastWithRows).toBeDefined();

    const continuation = pages.find(
      (p, i) =>
        i > 0 &&
        p.blockIds.some((id) => id.startsWith("metrics-row-")) &&
        !p.blockIds.includes("metrics-title")
    );
    if (continuation) {
      expect(continuation.blockIds).toContain("metrics-head");
    }
  });

  it("does not split a single block across pages", () => {
    const pages = paginateReportBlocks(
      [{ id: "charts", height: 200 }],
      100,
      0
    );
    expect(pages).toHaveLength(1);
    expect(pages[0].blockIds).toEqual(["charts"]);
  });

  it("starts metrics section on a new page after highlights and charts", () => {
    const blocks = [
      { id: "highlights", height: 120 },
      { id: "charts", height: 140 },
      { id: "metrics-title", height: 24 },
      { id: "metrics-head", height: 32 },
      { id: "metrics-row-0", height: 28 },
    ];

    const pages = paginateReportBlocks(blocks, 400, 16);

    const metricsPage = pages.find((p) => p.blockIds.includes("metrics-title"));
    expect(metricsPage).toBeDefined();
    expect(metricsPage!.blockIds[0]).toBe("metrics-title");
    expect(metricsPage!.blockIds).not.toContain("charts");
  });
});
