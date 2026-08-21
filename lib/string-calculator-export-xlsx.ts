import ExcelJS from "exceljs";
import { percentPerCFromAlpha } from "./string-calculator";
import type { StringCalcSnapshot } from "./string-calculator-snapshot";

const RED = "E40011";
const SLATE = "0F172A";
const SECTION = "F1F5F9";
const HEADER = "1E293B";
const INPUT = "FEF9C3";
const RESULT = "FEE2E2";
const MUTED = "64748B";

const COL_SYMBOL = 1;
const COL_DESC = 2;
const COL_UNIT = 3;
const COL_FIRST = 4;

function n(value: number, digits = 4): number {
  return Number(value.toFixed(digits));
}

function excelCol(col: number): string {
  let s = "";
  let x = col;
  while (x > 0) {
    const r = (x - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    x = Math.floor((x - 1) / 26);
  }
  return s;
}

function addr(row: number, col: number): string {
  return `${excelCol(col)}${row}`;
}

function absAddr(row: number, col: number): string {
  return `$${excelCol(col)}$${row}`;
}

function fill(cell: ExcelJS.Cell, hex: string) {
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: `FF${hex}` },
  };
}

function border(cell: ExcelJS.Cell) {
  const line: ExcelJS.Border = { style: "thin", color: { argb: "FFCBD5E1" } };
  cell.border = { top: line, left: line, bottom: line, right: line };
}

function sectionTitle(
  ws: ExcelJS.Worksheet,
  row: number,
  lastCol: number,
  text: string
) {
  ws.mergeCells(row, COL_SYMBOL, row, lastCol);
  const cell = ws.getCell(row, COL_SYMBOL);
  cell.value = text;
  cell.font = { name: "Calibri", size: 12, bold: true, color: { argb: "FF0F172A" } };
  fill(cell, SECTION);
  cell.alignment = { vertical: "middle", wrapText: true };
  ws.getRow(row).height = 22;
}

function headerRow(
  ws: ExcelJS.Worksheet,
  row: number,
  moduleCount: number,
  labels: string[]
) {
  const titles = ["Symbol", "Description", "Unit", ...labels];
  titles.forEach((title, i) => {
    const cell = ws.getCell(row, i + 1);
    cell.value = title;
    cell.font = {
      name: "Calibri",
      size: 10,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    fill(cell, HEADER);
    cell.alignment = { vertical: "middle", wrapText: true };
    border(cell);
  });
  if (moduleCount === 0) {
    const cell = ws.getCell(row, COL_FIRST);
    cell.value = "Value";
    cell.font = {
      name: "Calibri",
      size: 10,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    fill(cell, HEADER);
    border(cell);
  }
  ws.getRow(row).height = 20;
}

function labelRow(
  ws: ExcelJS.Worksheet,
  row: number,
  lastCol: number,
  symbol: string,
  description: string,
  unit: string
) {
  const a = ws.getCell(row, COL_SYMBOL);
  const b = ws.getCell(row, COL_DESC);
  const c = ws.getCell(row, COL_UNIT);
  a.value = symbol;
  b.value = description;
  c.value = unit;
  a.font = { name: "Calibri", size: 10, bold: true, color: { argb: `FF${SLATE}` } };
  b.font = { name: "Calibri", size: 10, color: { argb: "FF334155" } };
  c.font = { name: "Calibri", size: 10, italic: true, color: { argb: `FF${MUTED}` } };
  a.alignment = { vertical: "middle" };
  b.alignment = { vertical: "middle", wrapText: true };
  c.alignment = { vertical: "middle", horizontal: "center" };
  for (let col = COL_SYMBOL; col <= lastCol; col++) border(ws.getCell(row, col));
}

function numberCell(
  cell: ExcelJS.Cell,
  formula: string,
  result: number,
  digits: number,
  kind: "input" | "calc" | "result" = "calc"
) {
  cell.value = { formula, result: n(result, digits) };
  cell.numFmt = digits <= 0 ? "0" : `0.${"0".repeat(digits)}`;
  cell.font = {
    name: "Calibri",
    size: 10,
    bold: kind === "result",
    color: { argb: kind === "result" ? `FF${RED}` : "FF0F172A" },
  };
  cell.alignment = { vertical: "middle", horizontal: "center" };
  if (kind === "input") fill(cell, INPUT);
  if (kind === "result") fill(cell, RESULT);
}

function textCell(
  cell: ExcelJS.Cell,
  formula: string,
  result: string,
  kind: "input" | "calc" | "result" = "calc"
) {
  cell.value = { formula, result };
  cell.font = { name: "Calibri", size: 10, bold: kind === "result" };
  cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  if (kind === "input") fill(cell, INPUT);
  if (kind === "result") fill(cell, RESULT);
}

function buildCalculationSheet(
  wb: ExcelJS.Workbook,
  snapshot: StringCalcSnapshot
): void {
  const rows = snapshot.result.rows;
  const moduleCount = Math.max(rows.length, 1);
  const lastCol = COL_FIRST + moduleCount - 1;
  const tEamdbt = snapshot.weather.tEamdbtC;
  const tStc = snapshot.result.params.tStcC;
  const iecOffset = snapshot.result.params.iecCellOffsetK;
  const vMax = snapshot.voltageLimitV;

  const ws = wb.addWorksheet("Calculator MANUAL", {
    views: [{ showGridLines: false, state: "frozen", ySplit: 3 }],
    pageSetup: {
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1,
      paperSize: 9,
    },
  });
  ws.columns = [
    { width: 16 },
    { width: 62 },
    { width: 10 },
    ...Array.from({ length: moduleCount }, () => ({ width: 18 })),
  ];

  ws.mergeCells(1, COL_SYMBOL, 1, lastCol);
  const title = ws.getCell(1, COL_SYMBOL);
  title.value = "LONGi string voltage — worked calculation";
  title.font = { name: "Calibri", size: 16, bold: true, color: { argb: "FFFFFFFF" } };
  fill(title, RED);
  title.alignment = { vertical: "middle" };
  ws.getRow(1).height = 28;

  ws.mergeCells(2, COL_SYMBOL, 2, lastCol);
  const sub = ws.getCell(2, COL_SYMBOL);
  const station = snapshot.weather.stationName
    ? `${snapshot.weather.stationName}${snapshot.weather.wmo ? ` · WMO ${snapshot.weather.wmo}` : ""}`
    : "ASHRAE station not selected";
  sub.value = [
    snapshot.project.clientName,
    snapshot.project.projectName,
    snapshot.project.location,
    snapshot.project.coordinates,
    station,
    `ASHRAE ${snapshot.weather.ashraeVersion}`,
    snapshot.generatedAtIso.slice(0, 10),
  ]
    .filter((part) => part && String(part).trim())
    .join("  ·  ");
  sub.font = { name: "Calibri", size: 9, color: { argb: `FF${MUTED}` } };
  sub.alignment = { wrapText: true, vertical: "middle" };
  ws.getRow(2).height = 32;

  ws.mergeCells(3, COL_SYMBOL, 3, lastCol);
  const src = ws.getCell(3, COL_SYMBOL);
  src.value = {
    text: snapshot.weather.sourceUrl || "https://ashrae-meteo.info/v3.0/",
    hyperlink: snapshot.weather.sourceUrl || "https://ashrae-meteo.info/v3.0/",
  };
  src.font = { name: "Calibri", size: 9, color: { argb: "FF2563EB" }, underline: true };

  const R = {
    sectionSite: 5,
    siteHeader: 6,
    tEamdbt: 7,
    iecOffset: 8,
    tStc: 9,
    vMax: 10,
    tminSource: 11,
    sectionModules: 13,
    moduleHeader: 14,
    power: 15,
    voc: 16,
    alphaFrac: 17,
    alphaPct: 18,
    mCount: 19,
    sectionIec: 21,
    iecNote: 22,
    tCell: 23,
    beta: 24,
    ku: 25,
    uOcArray: 26,
    uOcMax: 27,
    iecMargin: 28,
    iecCheck: 29,
    iecMaxM: 30,
    sectionConv: 32,
    convNote: 33,
    tConv: 34,
    vocT: 35,
    stringVoc: 36,
    convMargin: 37,
    convCheck: 38,
    convMaxM: 39,
    notes: 41,
  };

  const tRef = absAddr(R.tEamdbt, COL_FIRST);
  const offsetRef = absAddr(R.iecOffset, COL_FIRST);
  const stcRef = absAddr(R.tStc, COL_FIRST);
  const vmaxRef = absAddr(R.vMax, COL_FIRST);

  sectionTitle(ws, R.sectionSite, lastCol, "1. Shared site inputs  (yellow cells can be edited)");
  headerRow(ws, R.siteHeader, 1, ["Value"]);

  const siteRows: Array<{
    row: number;
    symbol: string;
    desc: string;
    unit: string;
    value: number | string;
    digits?: number;
    input?: boolean;
  }> = [
    {
      row: R.tEamdbt,
      symbol: "T_EAMDBT",
      desc: "Extreme annual mean minimum dry-bulb temperature (ASHRAE)",
      unit: "°C",
      value: tEamdbt,
      digits: 2,
      input: true,
    },
    {
      row: R.iecOffset,
      symbol: "ΔT_IEC",
      desc: "IEC 62548-1:2023 F.1.1.b cell-temperature offset",
      unit: "K",
      value: iecOffset,
      digits: 0,
      input: true,
    },
    {
      row: R.tStc,
      symbol: "T_STC",
      desc: "Standard Test Conditions temperature",
      unit: "°C",
      value: tStc,
      digits: 0,
      input: true,
    },
    {
      row: R.vMax,
      symbol: "V_max",
      desc: "Maximum system voltage",
      unit: "V",
      value: vMax,
      digits: 0,
      input: true,
    },
  ];

  for (const item of siteRows) {
    labelRow(ws, item.row, COL_FIRST, item.symbol, item.desc, item.unit);
    const cell = ws.getCell(item.row, COL_FIRST);
    if (typeof item.value === "number") {
      cell.value = n(item.value, item.digits ?? 2);
      cell.numFmt = (item.digits ?? 2) <= 0 ? "0" : `0.${"0".repeat(item.digits ?? 2)}`;
    } else {
      cell.value = item.value;
    }
    cell.font = { name: "Calibri", size: 10, bold: true };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    if (item.input) fill(cell, INPUT);
  }

  labelRow(
    ws,
    R.tminSource,
    COL_FIRST,
    "Source",
    "Where T_EAMDBT was taken from",
    "—"
  );
  ws.getCell(R.tminSource, COL_FIRST).value = snapshot.weather.tminManual
    ? "Manual override"
    : "ASHRAE";
  ws.getCell(R.tminSource, COL_FIRST).alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  sectionTitle(
    ws,
    R.sectionModules,
    lastCol,
    "2. Module inputs  (one column per module; yellow cells can be edited)"
  );
  headerRow(
    ws,
    R.moduleHeader,
    rows.length,
    rows.map((row) => row.module.model)
  );

  const moduleMeta = [
    { row: R.power, symbol: "P_STC", desc: "Module power at STC", unit: "W" },
    {
      row: R.voc,
      symbol: "U_oc,STC",
      desc: "Open-circuit voltage at STC",
      unit: "V",
    },
    {
      row: R.alphaFrac,
      symbol: "α_Voc",
      desc: "Voc temperature coefficient (fraction) = α_Voc,% ÷ 100",
      unit: "1/°C",
    },
    {
      row: R.alphaPct,
      symbol: "α_Voc,%",
      desc: "Voc temperature coefficient from PAN / datasheet",
      unit: "%/°C",
    },
    {
      row: R.mCount,
      symbol: "M",
      desc: "Number of modules in series per string",
      unit: "—",
    },
  ];
  for (const meta of moduleMeta) {
    labelRow(ws, meta.row, lastCol, meta.symbol, meta.desc, meta.unit);
  }

  rows.forEach((row, i) => {
    const col = COL_FIRST + i;
    const alphaPct = addr(R.alphaPct, col);
    const m = row.module;

    const power = ws.getCell(R.power, col);
    power.value = m.powerWp || "";
    power.numFmt = "0";
    power.font = { name: "Calibri", size: 10 };
    power.alignment = { vertical: "middle", horizontal: "center" };
    fill(power, INPUT);

    const vocCell = ws.getCell(R.voc, col);
    vocCell.value = n(m.vocStc, 2);
    vocCell.numFmt = "0.00";
    vocCell.font = { name: "Calibri", size: 10, bold: true };
    vocCell.alignment = { vertical: "middle", horizontal: "center" };
    fill(vocCell, INPUT);

    numberCell(
      ws.getCell(R.alphaFrac, col),
      `${alphaPct}/100`,
      m.alphaVocPerC,
      6,
      "calc"
    );

    const alphaPctCell = ws.getCell(R.alphaPct, col);
    alphaPctCell.value = n(percentPerCFromAlpha(m.alphaVocPerC), 4);
    alphaPctCell.numFmt = "0.00";
    alphaPctCell.font = { name: "Calibri", size: 10, bold: true };
    alphaPctCell.alignment = { vertical: "middle", horizontal: "center" };
    fill(alphaPctCell, INPUT);

    const mCell = ws.getCell(R.mCount, col);
    mCell.value = m.modulesPerString;
    mCell.numFmt = "0";
    mCell.font = { name: "Calibri", size: 10, bold: true };
    mCell.alignment = { vertical: "middle", horizontal: "center" };
    fill(mCell, INPUT);
  });

  sectionTitle(
    ws,
    R.sectionIec,
    lastCol,
    "3. IEC 62548-1:2023  Clause F.1.1.b   —  cell temperature = T_EAMDBT + 10 K"
  );
  ws.mergeCells(R.iecNote, COL_SYMBOL, R.iecNote, lastCol);
  ws.getCell(R.iecNote, COL_SYMBOL).value =
    "K_U = 1 + β_V × (T_cell − T_STC) / U_oc,STC    where    β_V = α_Voc × U_oc,STC    and    U_oc,max = K_U × M × U_oc,STC";
  ws.getCell(R.iecNote, COL_SYMBOL).font = {
    name: "Calibri",
    size: 9,
    italic: true,
    color: { argb: `FF${MUTED}` },
  };

  labelRow(
    ws,
    R.tCell,
    lastCol,
    "T_cell",
    "T_cell = T_EAMDBT + ΔT_IEC",
    "°C"
  );
  labelRow(
    ws,
    R.beta,
    lastCol,
    "β_V",
    "β_V = α_Voc × U_oc,STC",
    "V/°C"
  );
  labelRow(
    ws,
    R.ku,
    lastCol,
    "K_U",
    "K_U = 1 + β_V × (T_cell − T_STC) / U_oc,STC",
    "—"
  );
  labelRow(
    ws,
    R.uOcArray,
    lastCol,
    "U_oc,array",
    "Uncorrected array Voc = M × U_oc,STC",
    "V"
  );
  labelRow(
    ws,
    R.uOcMax,
    lastCol,
    "U_oc,max",
    "Corrected maximum array Voc = K_U × U_oc,array",
    "V"
  );
  labelRow(ws, R.iecMargin, lastCol, "Margin", "V_max − U_oc,max", "V");
  labelRow(ws, R.iecCheck, lastCol, "Check", "U_oc,max ≤ V_max ?", "—");
  labelRow(
    ws,
    R.iecMaxM,
    lastCol,
    "M_max",
    "Largest integer M with U_oc,max ≤ V_max",
    "—"
  );

  rows.forEach((row, i) => {
    const col = COL_FIRST + i;
    const voc = addr(R.voc, col);
    const alpha = addr(R.alphaFrac, col);
    const m = addr(R.mCount, col);
    const tCell = addr(R.tCell, col);
    const beta = addr(R.beta, col);
    const ku = addr(R.ku, col);
    const uArr = addr(R.uOcArray, col);
    const uMax = addr(R.uOcMax, col);

    numberCell(
      ws.getCell(R.tCell, col),
      `${tRef}+${offsetRef}`,
      row.iec.tUsedC,
      2
    );
    numberCell(ws.getCell(R.beta, col), `${alpha}*${voc}`, row.iec.betaVPerC ?? 0, 6);
    numberCell(
      ws.getCell(R.ku, col),
      `1+${beta}*(${tCell}-${stcRef})/${voc}`,
      row.iec.ku ?? 0,
      6
    );
    numberCell(ws.getCell(R.uOcArray, col), `${m}*${voc}`, row.iec.uOcArrayV ?? 0, 2);
    numberCell(ws.getCell(R.uOcMax, col), `${ku}*${uArr}`, row.iec.stringVocV, 2, "result");
    numberCell(
      ws.getCell(R.iecMargin, col),
      `${vmaxRef}-${uMax}`,
      row.iec.marginV,
      2
    );
    textCell(
      ws.getCell(R.iecCheck, col),
      `IF(${uMax}<=${vmaxRef},"Within limit","Exceeds limit")`,
      row.iec.withinLimit ? "Within limit" : "Exceeds limit",
      "result"
    );
    numberCell(
      ws.getCell(R.iecMaxM, col),
      `INT(${vmaxRef}/(${ku}*${voc}))`,
      row.iec.maxModules,
      0
    );
  });

  sectionTitle(
    ws,
    R.sectionConv,
    lastCol,
    "4. Conventional method   —  cell temperature taken as T_EAMDBT (no +10 K)"
  );
  ws.mergeCells(R.convNote, COL_SYMBOL, R.convNote, lastCol);
  ws.getCell(R.convNote, COL_SYMBOL).value =
    "Voc(T) = U_oc,STC × [1 + α_Voc × (T − T_STC)]     then     string Voc = Voc(T) × M";
  ws.getCell(R.convNote, COL_SYMBOL).font = {
    name: "Calibri",
    size: 9,
    italic: true,
    color: { argb: `FF${MUTED}` },
  };

  labelRow(ws, R.tConv, lastCol, "T", "Assumed cell temperature = T_EAMDBT", "°C");
  labelRow(
    ws,
    R.vocT,
    lastCol,
    "Voc(T)",
    "Voc(T) = U_oc,STC × [1 + α_Voc × (T − T_STC)]",
    "V"
  );
  labelRow(
    ws,
    R.stringVoc,
    lastCol,
    "U_string",
    "String Voc = Voc(T) × M",
    "V"
  );
  labelRow(ws, R.convMargin, lastCol, "Margin", "V_max − U_string", "V");
  labelRow(ws, R.convCheck, lastCol, "Check", "U_string ≤ V_max ?", "—");
  labelRow(
    ws,
    R.convMaxM,
    lastCol,
    "M_max",
    "Largest integer M with U_string ≤ V_max",
    "—"
  );

  rows.forEach((row, i) => {
    const col = COL_FIRST + i;
    const voc = addr(R.voc, col);
    const alpha = addr(R.alphaFrac, col);
    const m = addr(R.mCount, col);
    const t = addr(R.tConv, col);
    const vocT = addr(R.vocT, col);
    const uStr = addr(R.stringVoc, col);

    numberCell(ws.getCell(R.tConv, col), tRef, row.general.tUsedC, 2);
    numberCell(
      ws.getCell(R.vocT, col),
      `${voc}*(1+${alpha}*(${t}-${stcRef}))`,
      row.general.vocModuleV,
      4
    );
    numberCell(
      ws.getCell(R.stringVoc, col),
      `${vocT}*${m}`,
      row.general.stringVocV,
      2,
      "result"
    );
    numberCell(
      ws.getCell(R.convMargin, col),
      `${vmaxRef}-${uStr}`,
      row.general.marginV,
      2
    );
    textCell(
      ws.getCell(R.convCheck, col),
      `IF(${uStr}<=${vmaxRef},"Within limit","Exceeds limit")`,
      row.general.withinLimit ? "Within limit" : "Exceeds limit",
      "result"
    );
    numberCell(
      ws.getCell(R.convMaxM, col),
      `INT(${vmaxRef}/${vocT})`,
      row.general.maxModules,
      0
    );
  });

  ws.mergeCells(R.notes, COL_SYMBOL, R.notes, lastCol);
  ws.getCell(R.notes, COL_SYMBOL).value =
    "Yellow cells are inputs. Changing T_EAMDBT, V_max, Voc, α_Voc,% or M recalculates both methods. Red cells are the governing string voltages. IEC is generally less conservative because T_cell is 10 K warmer than T_EAMDBT, so Voc is lower.";
  ws.getCell(R.notes, COL_SYMBOL).font = {
    name: "Calibri",
    size: 9,
    color: { argb: `FF${MUTED}` },
  };
  ws.getCell(R.notes, COL_SYMBOL).alignment = { wrapText: true };
  ws.getRow(R.notes).height = 32;
}

export async function buildStringCalcWorkbook(
  snapshot: StringCalcSnapshot
): Promise<Blob> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "LONGi String Calculator";
  wb.created = new Date(snapshot.generatedAtIso);

  const info = wb.addWorksheet("Project Weather");
  info.columns = [{ width: 56 }, { width: 48 }];
  const infoRows: Array<[string, string | number]> = [
    ["Client Name", snapshot.project.clientName],
    ["Project name", snapshot.project.projectName],
    ["Suburb or Township, STATE, Country", snapshot.project.location],
    ["Co-ordinates", snapshot.project.coordinates],
    ["Nearest weather station", snapshot.weather.stationName],
    ["WMO", snapshot.weather.wmo],
    [
      "Distance to site (km)",
      snapshot.weather.distanceKm == null
        ? ""
        : n(snapshot.weather.distanceKm, 1),
    ],
    ["ASHRAE version", snapshot.weather.ashraeVersion],
    ["ASHRAE period", snapshot.weather.period],
    ["Source", snapshot.weather.sourceUrl],
    [
      "Extreme Annual Mean Minimum Dry Bulb Temperature (°C)",
      n(snapshot.weather.tEamdbtC, 2),
    ],
    ["Tmin source", snapshot.weather.tminManual ? "manual override" : "ASHRAE"],
    [
      "Standard Test Condition Ambient Temperature (°C)",
      snapshot.result.params.tStcC,
    ],
    ["IEC cell temperature offset (K)", snapshot.result.params.iecCellOffsetK],
    ["Max system voltage (V)", snapshot.voltageLimitV],
    ["Generated at", snapshot.generatedAtIso],
  ];
  infoRows.forEach(([label, value], i) => {
    info.getCell(i + 1, 1).value = label;
    info.getCell(i + 1, 1).font = { bold: true };
    info.getCell(i + 1, 2).value = value;
  });

  buildCalculationSheet(wb, snapshot);

  const summary = wb.addWorksheet("Summary");
  summary.columns = [
    { width: 28 },
    { width: 12 },
    { width: 10 },
    { width: 16 },
    { width: 14 },
    { width: 16 },
    { width: 14 },
    { width: 14 },
    { width: 12 },
  ];
  summary.addRow([
    "Module",
    "Power (W)",
    "M",
    "Conventional Voc (V)",
    "Rounded",
    "IEC Voc (V)",
    "Rounded",
    "Max M conventional",
    "Max M IEC",
  ]);
  summary.getRow(1).font = { bold: true };
  for (const row of snapshot.result.rows) {
    summary.addRow([
      row.module.model,
      row.module.powerWp,
      row.module.modulesPerString,
      n(row.general.stringVocV, 4),
      row.general.stringVocRoundedV,
      n(row.iec.stringVocV, 4),
      row.iec.stringVocRoundedV,
      row.general.maxModules,
      row.iec.maxModules,
    ]);
  }

  const buf = await wb.xlsx.writeBuffer();
  return new Blob([buf as ArrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
