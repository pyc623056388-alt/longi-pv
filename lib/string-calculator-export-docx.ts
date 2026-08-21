import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { percentPerCFromAlpha } from "./string-calculator";
import type { StringCalcSnapshot } from "./string-calculator-snapshot";

const RED = "E40011";
const NAVY = "0B1220";
const MUTED = "475569";

function p(text: string, opts?: { bold?: boolean; size?: number; color?: string; spaceAfter?: number }) {
  return new Paragraph({
    spacing: { after: opts?.spaceAfter ?? 120 },
    children: [
      new TextRun({
        text,
        font: "Calibri",
        size: opts?.size ?? 22,
        bold: opts?.bold,
        color: opts?.color ?? NAVY,
      }),
    ],
  });
}

function cell(text: string, opts?: { bold?: boolean; width?: number; fill?: string }) {
  const line = { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" };
  return new TableCell({
    width: opts?.width
      ? { size: opts.width, type: WidthType.DXA }
      : undefined,
    shading: opts?.fill ? { fill: opts.fill } : undefined,
    borders: { top: line, bottom: line, left: line, right: line },
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            font: "Calibri",
            size: 20,
            bold: opts?.bold,
            color: NAVY,
          }),
        ],
      }),
    ],
  });
}

export async function buildStringCalcDocx(snapshot: StringCalcSnapshot): Promise<Blob> {
  const date = new Date(snapshot.generatedAtIso);
  const dateLabel = date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const t = snapshot.weather.tEamdbtC;
  const tStc = snapshot.result.params.tStcC;
  const offset = snapshot.result.params.iecCellOffsetK;

  const methodBlocks = snapshot.result.rows.flatMap((row) => {
    const m = row.module;
    const alphaPct = percentPerCFromAlpha(m.alphaVocPerC);
    const vocG = row.general.vocModuleV;
    const factor = 1 + m.alphaVocPerC * (t - tStc);
    return [
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 280, after: 120 },
        children: [
          new TextRun({
            text: `String length for ${m.powerWp}W module (${m.model})`,
            font: "Calibri",
            bold: true,
            size: 28,
            color: RED,
          }),
        ],
      }),
      p("General method (cell temperature taken as ASHRAE Tmin)", { bold: true }),
      p(`Open-circuit voltage (Voc, STC): ${m.vocStc.toFixed(2)} V`),
      p(`Temperature coefficient of Voc: ${alphaPct.toFixed(2)} %/°C`),
      p(`Voc(T) = Voc(STC) × [1 + αVoc × (T − TSTC)]`),
      p(
        `where T = ${t.toFixed(1)}°C, TSTC = ${tStc}°C, αVoc = ${m.alphaVocPerC}/°C`
      ),
      p(
        `Voc(${t.toFixed(1)}°C) = ${m.vocStc.toFixed(2)} V × [1 + (${m.alphaVocPerC}) × (${t.toFixed(1)} − ${tStc})] = ${m.vocStc.toFixed(2)} V × ${factor.toFixed(4)} = ${vocG.toFixed(5)} V`
      ),
      p(
        `Total Voc of ${m.modulesPerString}-module string = ${vocG.toFixed(5)} V × ${m.modulesPerString} = ${row.general.stringVocV.toFixed(4)} V (rounded to ${row.general.stringVocRoundedV} V)`
      ),
      p(`Maximum string length at ${snapshot.voltageLimitV} V: ${row.general.maxModules} modules.`, {
        spaceAfter: 200,
      }),
      p("IEC 62548-1:2023 Clause F.1.1.b", { bold: true }),
      p(
        `T_cell = T_EAMDBT + ${offset} K = ${t.toFixed(1)} + ${offset} = ${row.iec.tUsedC.toFixed(1)}°C (IEC notes that using absolute minimum temperature for a site may be too conservative).`
      ),
      p(
        `β_V = αVoc × Voc = ${m.alphaVocPerC} /°C × ${m.vocStc.toFixed(2)} V = ${(row.iec.betaVPerC ?? 0).toFixed(5)} V/°C`
      ),
      p(
        `K_U = 1 + β_V × (T_cell − TSTC) / Voc = ${(row.iec.ku ?? 0).toFixed(4)}`
      ),
      p(
        `U_OC ARRAY = M × Voc = ${m.modulesPerString} × ${m.vocStc.toFixed(2)} V = ${(row.iec.uOcArrayV ?? 0).toFixed(2)} V`
      ),
      p(
        `U_OC MAX = K_U × U_OC ARRAY = ${(row.iec.ku ?? 0).toFixed(4)} × ${(row.iec.uOcArrayV ?? 0).toFixed(2)} V = ${row.iec.stringVocV.toFixed(2)} V (rounded to ${row.iec.stringVocRoundedV} V)`
      ),
      p(`Maximum string length at ${snapshot.voltageLimitV} V: ${row.iec.maxModules} modules.`),
    ];
  });

  const headerCells = [
    cell("Method", { bold: true, fill: "F1F5F9" }),
    ...snapshot.result.rows.map((row) =>
      cell(`${row.module.powerWp}W  ${row.module.model}`, { bold: true, fill: "F1F5F9" })
    ),
  ];
  const generalCells = [
    cell("General method (no +10 K)"),
    ...snapshot.result.rows.map((row) =>
      cell(
        `M = ${row.module.modulesPerString}; VOC = ${row.general.stringVocRoundedV} V; max M = ${row.general.maxModules}`
      )
    ),
  ];
  const iecCells = [
    cell("IEC 62548-1:2023 F.1.1.b"),
    ...snapshot.result.rows.map((row) =>
      cell(
        `M = ${row.module.modulesPerString}; VOC = ${row.iec.stringVocRoundedV} V; max M = ${row.iec.maxModules}`
      )
    ),
  ];

  const summaryTable = new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [
      2800,
      ...snapshot.result.rows.map(() =>
        Math.floor(6560 / Math.max(1, snapshot.result.rows.length))
      ),
    ],
    rows: [
      new TableRow({ children: headerCells }),
      new TableRow({ children: generalCells }),
      new TableRow({ children: iecCells }),
    ],
  });

  const stationLine = [
    snapshot.weather.stationName,
    snapshot.weather.wmo ? `WMO ${snapshot.weather.wmo}` : "",
    snapshot.weather.distanceKm != null
      ? `${Math.round(snapshot.weather.distanceKm)} km from site`
      : "",
    snapshot.weather.period ? `period ${snapshot.weather.period}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        headers: {
          default: new Header({
            children: [
              p("LONGi Solar Australia", { bold: true, size: 20, color: RED, spaceAfter: 40 }),
              p("Suite 17.02, 570 George Street", { size: 18, color: MUTED, spaceAfter: 0 }),
              p("Sydney, NSW 2000, Australia", { size: 18, color: MUTED, spaceAfter: 0 }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              p("https://www.longi.com/au/  ·  au@longi.com  ·  Tel: +61 2 8484 5805", {
                size: 16,
                color: MUTED,
                spaceAfter: 0,
              }),
              p("Internal technical letter — for reference only; not a contractual commitment.", {
                size: 16,
                color: MUTED,
                spaceAfter: 0,
              }),
            ],
          }),
        },
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "String Voltage Calculation letter",
                font: "Calibri",
                bold: true,
                size: 36,
                color: RED,
              }),
            ],
          }),
          p(dateLabel, { color: MUTED }),
          p(`To: ${snapshot.project.clientName || "—"}`, { bold: true }),
          p(
            `See below string calculation for ${snapshot.project.projectName || "the project"}.`
          ),
          p(
            "Two methods are presented. The first (general) method takes the temperature input as the cell temperature. The second method is described in IEC 62548-1:2023 Clause F.1.1.b, which defines a specific weather source, a specific weather variable name, and specifies exactly 10 K temperature correction. Applying this IEC clause to string voltage provides greater clarity and reduces ambiguity."
          ),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: "Location definition",
                font: "Calibri",
                bold: true,
                size: 28,
                color: RED,
              }),
            ],
          }),
          p(`Site name: ${snapshot.project.projectName || "—"}`),
          p(`Location description: ${snapshot.project.location || "—"}`),
          p(`Site co-ordinates: ${snapshot.project.coordinates || "—"}`),
          p(`Weather source: ${stationLine || "—"}`),
          p(
            `The weather source is referenced per IEC 62548-1:2023 F.1.1 Note 1 from ${snapshot.weather.sourceUrl}`
          ),
          p(
            `Extreme Annual Mean Minimum Dry Bulb Temperature: ${t.toFixed(1)}°C${snapshot.weather.tminManual ? " (manual override)" : ""}`
          ),
          p(`Max system voltage used for string-length check: ${snapshot.voltageLimitV} V`),
          ...methodBlocks,
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 280, after: 160 },
            children: [
              new TextRun({
                text: "Summary",
                font: "Calibri",
                bold: true,
                size: 28,
                color: RED,
              }),
            ],
          }),
          summaryTable,
          p(""),
          p("Sang Bui, Senior Product and Solution Manager", { bold: true, spaceAfter: 40 }),
          p("LONGi Solar Australia", { color: MUTED }),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}
