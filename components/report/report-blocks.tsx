import type { CSSProperties, ReactNode } from "react";
import { ReportBarChart } from "@/components/report/report-bar-chart";
import { getMessages } from "@/lib/i18n";
import { getReportLabels } from "@/lib/report-labels";
import {
  comparisonDeltaVariant,
  type MetricHighlightVariant,
} from "@/components/metric-highlight";
import {
  isMetricsRowBlockId,
  METRICS_HEAD_BLOCK_ID,
  REPORT_BLOCK_GAP_PX,
  REPORT_PAGE_HEIGHT_PX,
  REPORT_PAGE_PADDING_BOTTOM_PX,
  REPORT_PAGE_PADDING_TOP_PX,
  REPORT_PAGE_PADDING_X_PX,
  REPORT_PAGE_WIDTH_PX,
} from "@/lib/report-layout";
import {
  reportColors,
  reportFont,
  reportVariantBg,
  reportVariantColor,
} from "@/lib/report-styles";
import type { ReportSnapshot } from "@/lib/report-snapshot";
import type { ResultMetricRow } from "@/lib/pv-calculation";
import type { AppLocale } from "@/lib/i18n";

const METRICS_COL_WIDTHS = ["32%", "24%", "24%", "20%"] as const;

function fieldSep(locale: AppLocale): string {
  return locale === "zh" ? "：" : ": ";
}

function formatWeatherLine(snapshot: ReportSnapshot): string {
  const { weatherName, weatherLocation, locale } = snapshot;
  if (!weatherLocation || weatherLocation === weatherName) {
    return weatherName;
  }
  if (weatherLocation.startsWith(weatherName)) {
    return weatherLocation;
  }
  const wrap =
    locale === "zh"
      ? `（${weatherLocation}）`
      : ` (${weatherLocation})`;
  return `${weatherName}${wrap}`;
}

/** Width of one chart column inside the 3-column highlights grid */
function reportChartColumnWidth(): number {
  const contentW =
    REPORT_PAGE_WIDTH_PX - 2 * REPORT_PAGE_PADDING_X_PX;
  const gap = 12;
  return Math.floor((contentW - 2 * gap) / 3 - 16);
}

const sectionTitleStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  margin: "0 0 8px",
  color: reportColors.text,
};

export function ReportBlock({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return <div data-report-block={id}>{children}</div>;
}

function SpecTable({
  side,
  title,
  labels,
}: {
  side: ReportSnapshot["longi"];
  title: string;
  labels: ReturnType<typeof getMessages>["report"]["specTable"];
}) {
  const rows: [string, string][] = [
    [labels.model, `${side.manufacturer} ${side.model}`],
    [labels.displayName, side.displayName],
    [labels.power, `${side.power} Wp`],
    [labels.dimensions, side.dimensions],
    [labels.tempCoef, `${side.tempCoef} %/°C`],
    [labels.firstYearDeg, `${side.firstYearDeg} %`],
    [labels.annualDeg, `${side.annualDeg} %`],
    [labels.price, side.price],
  ];
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <h4
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: reportColors.brand,
          margin: "0 0 8px",
        }}
      >
        {title}
      </h4>
      <table
        style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}
      >
        <tbody>
          {rows.map(([label, value]) => (
            <tr
              key={label}
              style={{ borderBottom: `1px solid ${reportColors.borderLight}` }}
            >
              <td
                style={{
                  padding: "6px 8px 6px 0",
                  color: reportColors.textMuted,
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </td>
              <td
                style={{
                  padding: "6px 0",
                  color: reportColors.text,
                  fontWeight: 500,
                }}
              >
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const metricsTableStyle: CSSProperties = {
  width: "100%",
  fontSize: 11,
  borderCollapse: "collapse",
  tableLayout: "fixed",
};

function MetricsTableHead({ snapshot }: { snapshot: ReportSnapshot }) {
  const { results } = snapshot;
  const m = getMessages(snapshot.locale);
  const thBase: CSSProperties = {
    padding: 8,
    fontWeight: 600,
    color: reportColors.text,
  };
  return (
    <thead>
      <tr style={{ backgroundColor: reportColors.bgMuted }}>
        <th
          style={{
            ...thBase,
            width: METRICS_COL_WIDTHS[0],
            textAlign: "left",
          }}
        >
          {m.results.tableMetric}
        </th>
        <th
          style={{
            ...thBase,
            width: METRICS_COL_WIDTHS[1],
            textAlign: "right",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {results.longiLabel}
        </th>
        <th
          style={{
            ...thBase,
            width: METRICS_COL_WIDTHS[2],
            textAlign: "right",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {results.compLabel}
        </th>
        <th
          style={{
            ...thBase,
            width: METRICS_COL_WIDTHS[3],
            textAlign: "right",
          }}
        >
          {m.results.tableDelta}
        </th>
      </tr>
    </thead>
  );
}

function MetricsTableRow({ row }: { row: ResultMetricRow }) {
  const variant: MetricHighlightVariant = comparisonDeltaVariant(
    row.delta,
    row.metric,
    row.metricId
  );
  const deltaColor = reportVariantColor(variant);
  const deltaBg = reportVariantBg(variant);
  const cell: CSSProperties = {
    padding: 8,
    fontVariantNumeric: "tabular-nums",
  };
  return (
    <tr style={{ borderTop: `1px solid ${reportColors.borderLight}` }}>
      <td
        style={{
          ...cell,
          fontWeight: 500,
          color: reportColors.text,
          textAlign: "left",
        }}
      >
        {row.metric}
      </td>
      <td
        style={{
          ...cell,
          textAlign: "right",
          color: reportColors.text,
        }}
      >
        {row.longi}
      </td>
      <td
        style={{
          ...cell,
          textAlign: "right",
          color: reportColors.text,
        }}
      >
        {row.competitor}
      </td>
      <td
        style={{
          ...cell,
          textAlign: "right",
          color: deltaColor,
          backgroundColor: deltaBg,
          fontWeight: 600,
        }}
      >
        {row.delta}
      </td>
    </tr>
  );
}

function blockGapAfter(prevId: string | null, nextId: string | null): number {
  if (!prevId || !nextId) return REPORT_BLOCK_GAP_PX;
  if (prevId === METRICS_HEAD_BLOCK_ID && isMetricsRowBlockId(nextId)) {
    return 0;
  }
  if (isMetricsRowBlockId(prevId) && isMetricsRowBlockId(nextId)) {
    return 0;
  }
  return REPORT_BLOCK_GAP_PX;
}

function PageWatermark({ text }: { text: string }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <p
        style={{
          color: "#e2e8f0",
          fontWeight: 700,
          fontSize: 36,
          transform: "rotate(-24deg)",
          whiteSpace: "nowrap",
          opacity: 0.35,
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}

export interface ReportBlockContext {
  snapshot: ReportSnapshot;
  logoDataUrl?: string | null;
}

export function renderReportBlock(
  blockId: string,
  ctx: ReportBlockContext
): ReactNode {
  const { snapshot, logoDataUrl } = ctx;
  const { results } = snapshot;
  const reportLabels = getReportLabels(snapshot.locale);
  const m = getMessages(snapshot.locale);

  switch (blockId) {
    case "header":
      return (
        <ReportBlock id="header">
          <header
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              borderBottom: `2px solid ${reportColors.brand}`,
              paddingBottom: 16,
            }}
          >
            {logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoDataUrl} alt="LONGi" width={120} height={32} />
            ) : (
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: reportColors.brand,
                }}
              >
                LONGi
              </span>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: 1.25,
                  color: reportColors.text,
                }}
              >
                {reportLabels.title}
              </h1>
              <p
                style={{
                  fontSize: 11,
                  color: reportColors.textMuted,
                  margin: "4px 0 0",
                }}
              >
                {reportLabels.subtitle}
              </p>
            </div>
          </header>
        </ReportBlock>
      );

    case "project":
      return (
        <ReportBlock id="project">
          <h2 style={sectionTitleStyle}>{m.report.sections.project}</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              columnGap: 24,
              rowGap: 4,
              fontSize: 11,
            }}
          >
            <p style={{ margin: 0 }}>
              <span style={{ color: reportColors.textMuted }}>
                {m.report.projectFields.name}
                {fieldSep(snapshot.locale)}
              </span>
              <span style={{ fontWeight: 600 }}>{snapshot.projectName}</span>
            </p>
            <p style={{ margin: 0 }}>
              <span style={{ color: reportColors.textMuted }}>
                {m.report.projectFields.generatedAt}
                {fieldSep(snapshot.locale)}
              </span>
              {snapshot.generatedAt}
            </p>
            <p style={{ margin: 0 }}>
              <span style={{ color: reportColors.textMuted }}>
                {m.report.projectFields.weather}
                {fieldSep(snapshot.locale)}
              </span>
              {formatWeatherLine(snapshot)}
            </p>
            <p style={{ margin: 0 }}>
              <span style={{ color: reportColors.textMuted }}>
                {m.report.projectFields.comparisonMode}
                {fieldSep(snapshot.locale)}
              </span>
              {snapshot.comparisonModeLabel}
            </p>
            <p style={{ margin: 0 }}>
              <span style={{ color: reportColors.textMuted }}>
                {m.report.projectFields.scale}
                {fieldSep(snapshot.locale)}
              </span>
              {snapshot.quantityLabel}
            </p>
            <p style={{ margin: 0 }}>
              <span style={{ color: reportColors.textMuted }}>
                {m.report.projectFields.currency}
                {fieldSep(snapshot.locale)}
              </span>
              {snapshot.currencyLabel}
            </p>
          </div>
        </ReportBlock>
      );

    case "basic-params":
      return (
        <ReportBlock id="basic-params">
          <h2 style={sectionTitleStyle}>{m.report.sections.basicParams}</h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              columnGap: 24,
              rowGap: 4,
              fontSize: 11,
            }}
          >
            {snapshot.basicParamsLines.map((line) => (
              <p key={line.label} style={{ margin: 0 }}>
                <span style={{ color: reportColors.textMuted }}>
                  {line.label}：
                </span>
                {line.value}
              </p>
            ))}
          </div>
        </ReportBlock>
      );

    case "modules":
      return (
        <ReportBlock id="modules">
          <h2 style={sectionTitleStyle}>{m.report.sections.modules}</h2>
          <div style={{ display: "flex", gap: 24 }}>
            <SpecTable
              side={snapshot.longi}
              title={m.chart.longi}
              labels={m.report.specTable}
            />
            <SpecTable
              side={snapshot.competitor}
              title={m.chart.competitor}
              labels={m.report.specTable}
            />
          </div>
        </ReportBlock>
      );

    case "gain-strategies":
      return (
        <ReportBlock id="gain-strategies">
          <h2 style={sectionTitleStyle}>{m.report.sections.gainStrategies}</h2>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              fontSize: 11,
            }}
          >
            {snapshot.gainStrategies.map((line) => (
              <li key={line.title} style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: "#1e293b" }}>
                  {line.title}：
                </span>
                <span
                  style={{
                    color: line.enabled ? "#334155" : reportColors.textLight,
                  }}
                >
                  {line.detail}
                </span>
              </li>
            ))}
          </ul>
        </ReportBlock>
      );

    case "highlights":
      return (
        <ReportBlock id="highlights">
          <h2 style={sectionTitleStyle}>{m.report.sections.highlights}</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            {snapshot.highlights.map((h) => (
              <div
                key={h.title}
                style={{
                  border: `1px solid ${reportColors.border}`,
                  borderRadius: 8,
                  padding: 12,
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    color: reportColors.textMuted,
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {h.title}
                </p>
                <p
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: reportVariantColor(h.variant),
                    margin: "4px 0 0",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {h.value}
                  {h.unit ? (
                    <span style={{ fontSize: 14, fontWeight: 700 }}>
                      {h.unit}
                    </span>
                  ) : null}
                </p>
                <p
                  style={{
                    fontSize: 10,
                    color: reportColors.textMuted,
                    margin: "8px 0 0",
                    lineHeight: 1.4,
                  }}
                >
                  {h.caption}
                </p>
              </div>
            ))}
          </div>
        </ReportBlock>
      );

    case "charts":
      return (
        <ReportBlock id="charts">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            {snapshot.chartConfigs.map((cfg) => (
              <div
                key={cfg.key}
                style={{
                  border: `1px solid ${reportColors.border}`,
                  borderRadius: 8,
                  padding: 8,
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#334155",
                    margin: "0 0 4px",
                  }}
                >
                  {cfg.title}
                </p>
                <ReportBarChart
                  data={results.chartData}
                  dataKey={cfg.key}
                  formatValue={cfg.formatValue}
                  width={reportChartColumnWidth()}
                />
              </div>
            ))}
          </div>
        </ReportBlock>
      );

    case "metrics-title":
      return (
        <ReportBlock id="metrics-title">
          <h2 style={sectionTitleStyle}>{m.report.projectFields.metrics}</h2>
        </ReportBlock>
      );

    case "metrics-head":
      return (
        <ReportBlock id="metrics-head">
          <table
            style={{
              ...metricsTableStyle,
              border: `1px solid ${reportColors.border}`,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <MetricsTableHead snapshot={snapshot} />
          </table>
        </ReportBlock>
      );

    case "footer":
      return (
        <ReportBlock id="footer">
          <footer
            style={{
              borderTop: `1px solid ${reportColors.border}`,
              paddingTop: 12,
              fontSize: 9,
              color: reportColors.textMuted,
              lineHeight: 1.5,
            }}
          >
            <p style={{ margin: 0 }}>{snapshot.disclaimer}</p>
            <p style={{ margin: "6px 0 0" }}>{snapshot.legalNotice}</p>
            <p style={{ margin: "4px 0 0", color: reportColors.text }}>
              {snapshot.attribution}
            </p>
            <p style={{ margin: "4px 0 0", color: reportColors.text }}>
              {snapshot.feedback}
            </p>
            <p style={{ margin: "4px 0 0", color: reportColors.textLight }}>
              {m.report.projectFields.footer(
                snapshot.version,
                snapshot.generatedAt
              )}
            </p>
          </footer>
        </ReportBlock>
      );

    default: {
      const rowMatch = /^metrics-row-(\d+)$/.exec(blockId);
      if (!rowMatch) return null;
      const row = results.rows[Number(rowMatch[1])];
      if (!row) return null;
      return (
        <ReportBlock id={blockId}>
          <table
            style={{
              ...metricsTableStyle,
              border: `1px solid ${reportColors.border}`,
              borderTop: "none",
            }}
          >
            <tbody>
              <MetricsTableRow row={row} />
            </tbody>
          </table>
        </ReportBlock>
      );
    }
  }
}

export function ReportMeasureDocument({
  snapshot,
  logoDataUrl,
  blockIds,
}: {
  snapshot: ReportSnapshot;
  logoDataUrl?: string | null;
  blockIds: string[];
}) {
  const ctx: ReportBlockContext = { snapshot, logoDataUrl };
  return (
    <div
      id="report-measure-root"
      style={{
        width: REPORT_PAGE_WIDTH_PX,
        backgroundColor: reportColors.bg,
        fontFamily: reportFont,
        boxSizing: "border-box",
      }}
    >
      {blockIds.map((id) => (
        <div
          key={id}
          data-measure-wrapper={id}
          style={{ marginBottom: REPORT_BLOCK_GAP_PX }}
        >
          {renderReportBlock(id, ctx)}
        </div>
      ))}
    </div>
  );
}

export function ReportPaginatedDocument({
  snapshot,
  logoDataUrl,
  pages,
}: {
  snapshot: ReportSnapshot;
  logoDataUrl?: string | null;
  pages: { blockIds: string[] }[];
}) {
  const ctx: ReportBlockContext = { snapshot, logoDataUrl };

  return (
    <div id="report-export-root">
      {pages.map((page, pageIndex) => (
        <div
          key={pageIndex}
          className="report-pdf-page"
          data-page-index={pageIndex}
          style={{
            width: REPORT_PAGE_WIDTH_PX,
            height: REPORT_PAGE_HEIGHT_PX,
            boxSizing: "border-box",
            padding: `${REPORT_PAGE_PADDING_TOP_PX}px ${REPORT_PAGE_PADDING_X_PX}px ${REPORT_PAGE_PADDING_BOTTOM_PX}px`,
            backgroundColor: reportColors.bg,
            color: reportColors.text,
            fontFamily: reportFont,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <PageWatermark text={snapshot.watermark} />
          <div style={{ position: "relative" }}>
            {page.blockIds.map((id, i) => {
              const prev = i > 0 ? page.blockIds[i - 1]! : null;
              const marginTop =
                i === 0 ? 0 : blockGapAfter(prev, id);
              const tableFlush =
                i > 0 &&
                marginTop === 0 &&
                prev != null &&
                (prev === METRICS_HEAD_BLOCK_ID || isMetricsRowBlockId(prev));
              return (
                <div
                  key={`${pageIndex}-${id}`}
                  style={{
                    marginTop: tableFlush ? -1 : marginTop,
                  }}
                >
                  {renderReportBlock(id, ctx)}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
