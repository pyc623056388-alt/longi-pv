"use client";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ReportMeasureDocument,
  ReportPaginatedDocument,
} from "@/components/report/report-blocks";
import { sanitizeClonedReportDocument } from "@/lib/report-export-sanitize";
import {
  getReportBlockIds,
  REPORT_CONTENT_MAX_HEIGHT_PX,
  REPORT_PAGE_WIDTH_PX,
} from "@/lib/report-layout";
import { paginateReportBlocks, type MeasuredBlock } from "@/lib/report-paginate";
import type { ReportSnapshot } from "@/lib/report-snapshot";
import { reportPdfFilename } from "@/lib/report-snapshot";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

async function fetchLogoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch("/longi-logo.svg");
    if (!res.ok) return null;
    const svg = await res.text();
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  } catch {
    return null;
  }
}

function waitForImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));
  if (images.length === 0) return Promise.resolve();
  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        })
    )
  ).then(() => undefined);
}

function createExportIframe(): HTMLIFrameElement {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "report-export");
  iframe.style.cssText =
    "position:fixed;left:-10000px;top:0;width:794px;border:0;visibility:hidden;pointer-events:none;";
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument;
  if (!doc) {
    iframe.remove();
    throw new Error("无法创建导出画布");
  }
  doc.open();
  doc.write(
    '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body></body></html>'
  );
  doc.close();
  return iframe;
}

function mountMarkupInIframe(iframe: HTMLIFrameElement, markup: string): Document {
  const doc = iframe.contentDocument!;
  doc.body.innerHTML = markup;
  doc.body.style.margin = "0";
  doc.body.style.background = "#ffffff";
  doc.body.style.color = "#0f172a";
  return doc;
}

function isUnsupportedColorError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return /lab\(|oklch\(|unsupported color/i.test(err.message);
}

async function captureElementToCanvas(
  el: HTMLElement,
  win: Window,
  iframeDoc: Document
): Promise<HTMLCanvasElement> {
  const html2canvasOpts = {
    scale: 1.5,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: "#ffffff",
    width: REPORT_PAGE_WIDTH_PX,
    windowWidth: REPORT_PAGE_WIDTH_PX,
    height: el.offsetHeight,
    windowHeight: el.offsetHeight,
    scrollX: 0,
    scrollY: 0,
    window: win,
    onclone: (clonedDoc: Document, clonedEl: HTMLElement) => {
      sanitizeClonedReportDocument(clonedDoc, clonedEl);
    },
  } as const;

  sanitizeClonedReportDocument(iframeDoc, el);

  try {
    const { default: html2canvas } = await import("html2canvas");
    return html2canvas(el, html2canvasOpts);
  } catch (err) {
    if (!isUnsupportedColorError(err)) throw err;
  }

  const { domToCanvas } = await import("modern-screenshot");
  return domToCanvas(el, {
    scale: 1.5,
    width: REPORT_PAGE_WIDTH_PX,
    height: el.offsetHeight,
    backgroundColor: "#ffffff",
  });
}

function measureBlockHeights(
  doc: Document,
  blockIds: string[]
): MeasuredBlock[] {
  const root = doc.getElementById("report-measure-root");
  if (!root) throw new Error("测量容器未找到");

  return blockIds.map((id) => {
    const wrapper = root.querySelector(`[data-measure-wrapper="${id}"]`);
    const blockEl = wrapper?.querySelector(
      `[data-report-block="${id}"]`
    ) as HTMLElement | null;
    if (!blockEl) {
      throw new Error(`无法测量内容块：${id}`);
    }
    return {
      id,
      height: Math.ceil(blockEl.getBoundingClientRect().height),
    };
  });
}

export function exportPdfErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) {
    if (
      err.message.includes("oklch") ||
      err.message.includes("lab(") ||
      err.message.includes("unsupported color")
    ) {
      return "PDF 渲染遇到颜色格式问题，请刷新页面后重试";
    }
    return err.message;
  }
  return "未知错误，请刷新页面后重试";
}

export async function exportReportPdf(snapshot: ReportSnapshot): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const logoDataUrl = await fetchLogoDataUrl();
  const iframe = createExportIframe();
  const win = iframe.contentWindow;
  if (!win) {
    iframe.remove();
    throw new Error("无法访问导出窗口");
  }

  try {
    const blockIds = getReportBlockIds(snapshot.results.rows.length);

    const measureMarkup = renderToStaticMarkup(
      createElement(ReportMeasureDocument, {
        snapshot,
        logoDataUrl,
        blockIds,
      })
    );
    const measureDoc = mountMarkupInIframe(iframe, measureMarkup);
    await waitForImages(measureDoc.body);

    const measured = measureBlockHeights(measureDoc, blockIds);
    const pages = paginateReportBlocks(measured, REPORT_CONTENT_MAX_HEIGHT_PX);

    const paginatedMarkup = renderToStaticMarkup(
      createElement(ReportPaginatedDocument, {
        snapshot,
        logoDataUrl,
        pages,
      })
    );
    const exportDoc = mountMarkupInIframe(iframe, paginatedMarkup);
    await waitForImages(exportDoc.body);

    const pageEls = exportDoc.querySelectorAll(".report-pdf-page");
    if (!pageEls.length) throw new Error("报告分页失败");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    for (let i = 0; i < pageEls.length; i++) {
      const pageEl = pageEls[i] as HTMLElement;
      const canvas = await captureElementToCanvas(pageEl, win, exportDoc);
      if (!canvas.width || !canvas.height) {
        throw new Error("报告画布为空，请重试");
      }
      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
    }

    pdf.save(reportPdfFilename(snapshot.projectName, snapshot.locale));
  } finally {
    iframe.remove();
  }
}
