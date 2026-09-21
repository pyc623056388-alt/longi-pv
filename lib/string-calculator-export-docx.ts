import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  Packer,
  PageNumber,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { parseCoordinates } from "./ashrae-meteo";
import { LEGAL_SUPPORT } from "./legal-meta";
import { percentPerCFromAlpha } from "./string-calculator";
import { loadLetterPng, scaleToWidth, type LetterPng } from "./string-letter-images";
import type { StringCalcSnapshot } from "./string-calculator-snapshot";

const RED = "E40011";
const NAVY = "0B1220";
const MUTED = "475569";
const SUPPORT_TITLE = "Senior Product and Solution Manager";
const SUPPORT_EMAIL = "sangbui@longi.com";
const FIGURE_MAX_W = 520;

function p(
  text: string,
  opts?: { bold?: boolean; size?: number; color?: string; spaceAfter?: number; italics?: boolean }
) {
  return new Paragraph({
    spacing: { after: opts?.spaceAfter ?? 160 },
    children: [
      new TextRun({
        text,
        font: "Calibri",
        size: opts?.size ?? 22,
        bold: opts?.bold,
        italics: opts?.italics,
        color: opts?.color ?? NAVY,
      }),
    ],
  });
}

function heading(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 140 },
    children: [
      new TextRun({
        text,
        font: "Calibri",
        bold: true,
        size: 26,
        color: RED,
      }),
    ],
  });
}

function caption(text: string) {
  return p(text, { italics: true, size: 18, color: MUTED, spaceAfter: 200 });
}

function imageParagraph(img: LetterPng, maxWidth = FIGURE_MAX_W) {
  const size = scaleToWidth(img.width, img.height, maxWidth);
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new ImageRun({
        type: "png",
        data: img.data,
        transformation: { width: size.width, height: size.height },
        altText: { title: "figure", description: "Letter figure", name: "figure" },
      }),
    ],
  });
}

function thinBorder() {
  const line = { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" };
  return { top: line, bottom: line, left: line, right: line };
}

function infoCell(text: string, opts?: { bold?: boolean; fill?: string; width?: number }) {
  const lines = text.split("\n").filter((line) => line.length > 0);
  return new TableCell({
    width: opts?.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    shading: opts?.fill ? { fill: opts.fill } : undefined,
    borders: thinBorder(),
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: (lines.length ? lines : [""]).map(
      (line) =>
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: line,
              font: "Calibri",
              size: 20,
              bold: opts?.bold,
              color: NAVY,
            }),
          ],
        })
    ),
  });
}

function proximityTable(snapshot: StringCalcSnapshot): Table {
  const site = parseCoordinates(snapshot.project.coordinates);
  const w = snapshot.weather;
  const siteLine = [
    snapshot.project.projectName || "Project site",
    site ? `${site.lat.toFixed(6)}, ${site.lon.toFixed(6)}` : snapshot.project.coordinates,
  ]
    .filter(Boolean)
    .join("\n");
  const stationLine = [
    w.stationName || "Weather station",
    w.wmo ? `WMO ${w.wmo}` : "",
    w.stationLat != null && w.stationLon != null
      ? `${w.stationLat.toFixed(4)}, ${w.stationLon.toFixed(4)}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
  const distance =
    w.distanceKm != null
      ? `${Math.round(w.distanceKm)} km from site`
      : "Distance not available";

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [4680, 4680],
    rows: [
      new TableRow({
        children: [
          infoCell("Site", { bold: true, fill: "F1F5F9", width: 4680 }),
          infoCell("ASHRAE weather station", { bold: true, fill: "F1F5F9", width: 4680 }),
        ],
      }),
      new TableRow({
        children: [
          infoCell(siteLine, { width: 4680 }),
          infoCell(stationLine, { width: 4680 }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 2,
            borders: thinBorder(),
            shading: { fill: "FEF2F2" },
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `Distance: ${distance}`,
                    font: "Calibri",
                    size: 20,
                    bold: true,
                    color: RED,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function iecSection(snapshot: StringCalcSnapshot) {
  const t = snapshot.weather.tEamdbtC;
  const tStc = snapshot.result.params.tStcC;
  const offset = snapshot.result.params.iecCellOffsetK;
  const project = snapshot.project.projectName || "the project";

  return snapshot.result.rows.flatMap((row) => {
    const m = row.module;
    const alphaPct = percentPerCFromAlpha(m.alphaVocPerC);
    const beta = row.iec.betaVPerC ?? m.alphaVocPerC * m.vocStc;
    const ku = row.iec.ku ?? 0;
    const tCell = row.iec.tUsedC;
    const uArr = row.iec.uOcArrayV ?? m.modulesPerString * m.vocStc;
    const modelLabel = m.powerWp ? `${m.powerWp}W module` : "module";

    return [
      heading(
        `String length for ${modelLabel} calculated per IEC 62548-1:2023 Clause F.1.1.b`
      ),
      p("Define the module technical parameters (STC conditions)", { bold: true }),
      p(`PV Module: ${m.model}`),
      p(`Open-circuit voltage (U_OC,MOD): ${m.vocStc.toFixed(2)} V`),
      p(`Temperature coefficient of Voc: ${alphaPct.toFixed(2)} %/°C`),
      p("Calculate K_U, temperature correction factor", { bold: true }),
      p("K_U = 1 + β_V × (T_cell − T_STC) / U_OC,MOD"),
      p("Where:"),
      p(
        `T_cell = T_EAMDBT + ${offset} K = ${t.toFixed(1)} + ${offset} = ${tCell.toFixed(1)}°C`
      ),
      p(
        "IEC 62548-1:2023 F.1.1.b adds 10 K, noting that use of the absolute minimum temperature for a site may be too conservative."
      ),
      p(
        `β_V = ${alphaPct.toFixed(2)} %/°C × ${m.vocStc.toFixed(2)} V = ${beta.toFixed(5)} V/°C`
      ),
      p(`T_STC = ${tStc}°C`),
      p("Therefore:"),
      p(
        `K_U = 1 + (${beta.toFixed(5)} V/°C) × (${tCell.toFixed(1)}°C − ${tStc}°C) / ${m.vocStc.toFixed(2)} V = ${ku.toFixed(4)}`
      ),
      p(
        `Calculate the Voc of the ${m.modulesPerString}-module string (without temperature correction)`,
        { bold: true }
      ),
      p("U_OC,ARRAY = M × U_OC,MOD"),
      p("Where:"),
      p(`M = ${m.modulesPerString} modules in a string`),
      p(`U_OC,MOD = ${m.vocStc.toFixed(2)} V at STC`),
      p(
        `U_OC,ARRAY = ${m.modulesPerString} × ${m.vocStc.toFixed(2)} V = ${uArr.toFixed(2)} V`
      ),
      p(
        `Temperature-corrected PV array maximum voltage for the ${m.modulesPerString}-module string`,
        { bold: true }
      ),
      p("U_OC,MAX = K_U × U_OC,ARRAY"),
      p("Where:"),
      p(`K_U = ${ku.toFixed(4)}, calculated per IEC 62548-1:2023 F.1.1.b`),
      p(
        `U_OC,ARRAY = ${uArr.toFixed(2)} V for the ${m.modulesPerString}-module string`
      ),
      p(
        `U_OC,MAX = ${ku.toFixed(4)} × ${uArr.toFixed(2)} V = ${row.iec.stringVocV.toFixed(2)} V (rounded to ${row.iec.stringVocRoundedV} V)`
      ),
      p(
        `In summary, the ${m.modulesPerString}-module string calculation for ${m.model} using temperature correction per IEC 62548-1:2023 Clause F.1.1.b, compliant with AS/NZS 5033, is ${row.iec.stringVocRoundedV} V for ${project}.`
      ),
    ];
  });
}

function conventionalAppendix(snapshot: StringCalcSnapshot) {
  const t = snapshot.weather.tEamdbtC;
  const tStc = snapshot.result.params.tStcC;
  const blocks = snapshot.result.rows.flatMap((row) => {
    const m = row.module;
    const alphaPct = percentPerCFromAlpha(m.alphaVocPerC);
    return [
      p(`${m.model} (${m.powerWp || "—"} W)`, { bold: true, spaceAfter: 80 }),
      p(
        `Voc(T) = ${m.vocStc.toFixed(2)} V × [1 + (${m.alphaVocPerC}) × (${t.toFixed(1)} − ${tStc})] = ${row.general.vocModuleV.toFixed(4)} V`
      ),
      p(
        `String Voc = ${row.general.vocModuleV.toFixed(4)} V × ${m.modulesPerString} = ${row.general.stringVocV.toFixed(2)} V (rounded to ${row.general.stringVocRoundedV} V)`
      ),
      p(
        `Difference versus IEC U_OC,MAX: ${(row.general.stringVocV - row.iec.stringVocV).toFixed(2)} V. α_Voc used: ${alphaPct.toFixed(2)} %/°C.`,
        { spaceAfter: 200 }
      ),
    ];
  });

  return [
    heading("Appendix — Conventional method (not used for the declaration)"),
    p(
      "The figures below take cell temperature as T_EAMDBT with no +10 K offset. They are provided for information only and are not the declared string voltage.",
      { italics: true }
    ),
    ...blocks,
  ];
}

export async function buildStringCalcDocx(
  snapshot: StringCalcSnapshot
): Promise<Blob> {
  const [logo, asNzs, iecNote] = await Promise.all([
    loadLetterPng("logo"),
    loadLetterPng("asNzs5033"),
    loadLetterPng("iecNote1"),
  ]);

  const date = new Date(snapshot.generatedAtIso);
  const dateLabel = date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const t = snapshot.weather.tEamdbtC;
  const station = snapshot.weather.stationName
    ? `${snapshot.weather.stationName}${snapshot.weather.wmo ? ` (WMO: ${snapshot.weather.wmo})` : ""}`
    : "ASHRAE climatic design conditions";

  const headerChildren: Paragraph[] = [];
  if (logo) {
    const size = scaleToWidth(logo.width, logo.height, 140);
    headerChildren.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new ImageRun({
            type: "png",
            data: logo.data,
            transformation: { width: size.width, height: size.height },
            altText: { title: "LONGi", description: "LONGi logo", name: "logo" },
          }),
        ],
      })
    );
  } else {
    headerChildren.push(p("LONGi Solar Australia", { bold: true, size: 20, color: RED, spaceAfter: 40 }));
  }
  headerChildren.push(
    p("LONGi Solar Australia", { bold: true, size: 18, spaceAfter: 20 }),
    p("Suite 17.02, 570 George Street", { size: 16, color: MUTED, spaceAfter: 0 }),
    p("Sydney, NSW 2000, Australia", { size: 16, color: MUTED, spaceAfter: 0 })
  );

  const figure1 = asNzs
    ? [imageParagraph(asNzs), caption("Figure 1 — clipping of AS/NZS 5033:2021 Clause 4.2.1.3.1(b) stating that the PV array maximum voltage may be calculated per IEC 62548.")]
    : [caption("Figure 1 — AS/NZS 5033:2021 Clause 4.2.1.3.1(b): PV array maximum voltage may be calculated in accordance with IEC 62548.")];

  const figure2 = iecNote
    ? [imageParagraph(iecNote, 560), caption("Figure 2 — clipping of IEC 62548-1:2023 Clause F.1.1 Note 1. A source of Extreme Annual Mean Minimum Dry Bulb Temperature data is available at http://ashrae-meteo.info/.")]
    : [caption("Figure 2 — IEC 62548-1:2023 Clause F.1.1 Note 1 references http://ashrae-meteo.info/ for Extreme Annual Mean Minimum Dry Bulb Temperature.")];

  const attachments = snapshot.result.rows.map(
    (row) => `Attachment: ${row.module.model} Datasheet`
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 900, bottom: 720, left: 900, right: 900 },
          },
        },
        headers: {
          default: new Header({ children: headerChildren }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                spacing: { after: 40 },
                children: [
                  new TextRun({
                    text: "https://www.longi.com/en/",
                    font: "Calibri",
                    size: 16,
                    color: MUTED,
                  }),
                  new TextRun({
                    text: "      Page ",
                    font: "Calibri",
                    size: 16,
                    color: MUTED,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: "Calibri",
                    size: 16,
                    color: MUTED,
                  }),
                  new TextRun({
                    text: " of ",
                    font: "Calibri",
                    size: 16,
                    color: MUTED,
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: "Calibri",
                    size: 16,
                    color: MUTED,
                  }),
                ],
              }),
              p("Internal technical letter — for reference only; not a contractual commitment.", {
                size: 14,
                color: MUTED,
                spaceAfter: 0,
              }),
            ],
          }),
        },
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 160 },
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
          heading("Statement of Methodology"),
          p(
            "AS/NZS 5033:2021 Installation and safety requirements for photovoltaic (PV) arrays (herein referred to as AS/NZS 5033) is the governing standard for photovoltaic (PV) array installation design and safety in Australia and is routinely referenced within electrical safety legislation, network connection agreements, and contractual documentation for PV installations."
          ),
          p(
            "AS/NZS 5033 permits the use of IEC 62548 for calculating maximum PV array voltage. Specifically, AS/NZS 5033:2021 Clause 4.2.1.3.1(b) states that the PV array maximum voltage may be determined by being calculated in accordance with IEC 62548."
          ),
          ...figure1,
          p(
            "IEC 62548 is therefore applied in this assessment as a referenced and permitted calculation methodology under AS/NZS 5033."
          ),
          p(
            "The following method in this letter is described under IEC 62548-1:2023 Clause F.1.1.b, which defines a specific weather source, a specific weather variable, and specifies exactly +10 Kelvin temperature correction. Applying this IEC clause to string voltage provides greater clarity and reduces ambiguity."
          ),
          heading("Location definition"),
          p("Project Location", { bold: true }),
          p(`Site Name: ${snapshot.project.projectName || "—"}`),
          p(`Location Description: ${snapshot.project.location || "—"}`),
          p(`Site Co-ordinates: ${snapshot.project.coordinates || "—"}`),
          p("Define the temperature.", { bold: true }),
          p(`Source: ASHRAE ${station}`),
          p(
            `The above source is directly referenced per IEC 62548-1:2023 F.1.1 Note 1 from ${snapshot.weather.sourceUrl}`
          ),
          ...figure2,
          p(
            "In accordance with this approach, the project site coordinates were entered into the IEC-referenced climate data tool, which identifies nearby meteorological weather stations and associated historical temperature data."
          ),
          p(
            `Extreme Annual Mean Minimum Dry Bulb Temperature: ${t.toFixed(1)}°C${snapshot.weather.tminManual ? " (manual override)" : ""}`
          ),
          p(
            `The figure below shows the chosen weather station proximity to the site${snapshot.weather.distanceKm != null ? ` at ${Math.round(snapshot.weather.distanceKm)} km` : ""}.`
          ),
          proximityTable(snapshot),
          caption("Figure 3 — weather station proximity to the site."),
          ...iecSection(snapshot),
          ...conventionalAppendix(snapshot),
          p(""),
          p(`${LEGAL_SUPPORT}, ${SUPPORT_TITLE}`, { bold: true, spaceAfter: 40 }),
          p("LONGi Solar Australia", { spaceAfter: 40 }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new ExternalHyperlink({
                link: `mailto:${SUPPORT_EMAIL}`,
                children: [
                  new TextRun({
                    text: SUPPORT_EMAIL,
                    font: "Calibri",
                    size: 22,
                    color: "2563EB",
                    underline: {},
                  }),
                ],
              }),
            ],
          }),
          ...attachments.map((line) => p(line, { spaceAfter: 40 })),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}
