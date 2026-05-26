/** 从 datasheet 纯文本中抽取指定功率档的 STC 电参数 */

type StcElectricalKey = "vmp" | "imp" | "voc" | "isc";

export interface DatasheetPowerRow {
  powerWp: number;
  voc?: number;
  isc?: number;
  vmp?: number;
  imp?: number;
  lengthMm?: number;
  widthMm?: number;
  pmpTempCoef?: number;
  rawSnippet?: string;
}

const POWER_ALIASES = [
  "pmax",
  "p nom",
  "pnom",
  "pmpp",
  "maximum power",
  "max power",
  "rated power",
  "power at stc",
  "峰值功率",
  "最大功率",
];

function normalizeText(text: string): string {
  return text
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .toLowerCase();
}

function parseNum(s: string | undefined): number | undefined {
  if (s == null) return undefined;
  const n = parseFloat(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

function extractValuesWithUnit(line: string, unit: "V" | "A"): number[] {
  const re = unit === "V" ? /([\d.]+)\s*V/gi : /([\d.]+)\s*A/gi;
  const out: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    const n = parseNum(m[1]);
    if (n != null) out.push(n);
  }
  return out;
}

function extractPowersFromLine(line: string): number[] {
  const out: number[] = [];
  const re = /(\d{3})\s*W/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    out.push(parseInt(m[1], 10));
  }
  return out;
}

/** Canadian Solar 等：STC 表多列功率 */
export function parseStcMultiColumnTable(
  text: string,
  targetPowerWp: number
): DatasheetPowerRow | null {
  const blocks = text.split(/ELECTRICAL DATA\s*\|\s*STC/i);
  for (const block of blocks) {
    const pmaxMatch = block.match(
      /Nominal Max\.?\s*Power\s*\(Pmax\)([^\n]+)/i
    );
    if (!pmaxMatch) continue;

    const powers = extractPowersFromLine(pmaxMatch[1]);
    let idx = powers.indexOf(targetPowerWp);
    if (idx < 0) {
      const nearest = powers.find((p) => Math.abs(p - targetPowerWp) <= 15);
      if (nearest == null) continue;
      idx = powers.indexOf(nearest);
    }

    const rowDefs: [StcElectricalKey, RegExp, "V" | "A"][] = [
      ["vmp", /Opt\.?\s*Operating Voltage\s*\(Vmp\)([^\n]+)/i, "V"],
      ["imp", /Opt\.?\s*Operating Current\s*\(Imp\)([^\n]+)/i, "A"],
      ["voc", /Open Circuit Voltage\s*\(Voc\)([^\n]+)/i, "V"],
      ["isc", /Short Circuit Current\s*\(Isc\)([^\n]+)/i, "A"],
    ];

    const row: DatasheetPowerRow = { powerWp: powers[idx] ?? targetPowerWp };
    let ok = 0;
    for (const [key, re, unit] of rowDefs) {
      const m = block.match(re);
      if (!m) continue;
      const vals = extractValuesWithUnit(m[1], unit);
      const v = vals[idx];
      if (v != null) {
        row[key] = v;
        ok++;
      }
    }
    if (ok >= 3) return row;
  }
  return null;
}

/** 从一行或相邻行文本中提取 Voc/Isc/Vmp/Imp */
export function extractElectricalFromChunk(chunk: string): Partial<DatasheetPowerRow> {
  const out: Partial<DatasheetPowerRow> = {};
  const patterns: [StcElectricalKey, RegExp][] = [
    ["voc", /voc\s*(?:\([^)]*\))?\s*[:=]?\s*([\d.]+)/i],
    ["isc", /isc\s*(?:\([^)]*\))?\s*[:=]?\s*([\d.]+)/i],
    ["vmp", /v(?:mpp|mp)\s*(?:\([^)]*\))?\s*[:=]?\s*([\d.]+)/i],
    ["imp", /i(?:mpp|mp)\s*(?:\([^)]*\))?\s*[:=]?\s*([\d.]+)/i],
  ];
  for (const [key, re] of patterns) {
    const m = chunk.match(re);
    if (m) out[key] = parseNum(m[1]);
  }
  const pmax = chunk.match(
    /(?:pmax|p\s*max|maximum\s+power|峰值功率)\s*(?:\([^)]*\))?\s*[:=]?\s*([\d.]+)/i
  );
  if (pmax) out.powerWp = parseNum(pmax[1]) ?? out.powerWp;
  const temp = chunk.match(
    /(?:temp(?:erature)?\s*coeff(?:icient)?\s*(?:of)?\s*pmax|pmax\s*temp|μpmp|mupmp)\s*[:=]?\s*(-?[\d.]+)/i
  );
  if (temp) out.pmpTempCoef = parseNum(temp[1]);
  const dim = chunk.match(
    /(\d{3,4})\s*[×x]\s*(\d{3,4})\s*(?:mm)?/i
  );
  if (dim) {
    out.lengthMm = parseNum(dim[1]);
    out.widthMm = parseNum(dim[2]);
  }
  return out;
}

function lineHasPowerMarker(line: string, target: number): boolean {
  const t = line.toLowerCase();
  if (new RegExp(`\\b${target}\\b`).test(t)) return true;
  if (target === 475 && /\b475\b/.test(t)) return true;
  if (target === 510 && /\b510\b/.test(t)) return true;
  if (target === 515 && /\b515\b/.test(t)) return true;
  if (target === 620 && /\b620\b/.test(t)) return true;
  return false;
}

/**
 * 在全文里找最接近 targetPowerWp 的功率行（允许 ±5Wp），并抽取电参数。
 */
export function parseTextForPowerRow(
  text: string,
  targetPowerWp: number,
  options?: { powerTolerance?: number }
): DatasheetPowerRow | null {
  const table = parseStcMultiColumnTable(text, targetPowerWp);
  if (table && table.voc != null && table.isc != null && table.vmp != null && table.imp != null) {
    return table;
  }

  const tolerance = options?.powerTolerance ?? 5;
  const lines = text.split(/\n/);
  const candidates: { row: DatasheetPowerRow; score: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const windowLines = lines.slice(i, Math.min(i + 8, lines.length)).join("\n");
    const norm = normalizeText(windowLines);
    if (!lineHasPowerMarker(lines[i], targetPowerWp)) continue;

    const elec = extractElectricalFromChunk(windowLines);
    let power = elec.powerWp;
    if (power == null) {
      const m = windowLines.match(
        new RegExp(`\\b(${targetPowerWp}|${targetPowerWp - 5}|${targetPowerWp + 5})\\b`)
      );
      if (m) power = parseNum(m[1]);
    }
    if (power == null) power = targetPowerWp;

    if (Math.abs(power - targetPowerWp) > tolerance) continue;

    const row: DatasheetPowerRow = {
      powerWp: targetPowerWp,
      voc: elec.voc,
      isc: elec.isc,
      vmp: elec.vmp,
      imp: elec.imp,
      lengthMm: elec.lengthMm,
      widthMm: elec.widthMm,
      pmpTempCoef: elec.pmpTempCoef,
      rawSnippet: windowLines.slice(0, 400),
    };
    const filled = [row.voc, row.isc, row.vmp, row.imp].filter(
      (v) => v != null
    ).length;
    candidates.push({ row, score: filled * 10 - Math.abs(power - targetPowerWp) });
  }

  if (candidates.length === 0) {
    const elec = extractElectricalFromChunk(text.slice(0, 12000));
    if (elec.voc != null || elec.isc != null) {
      return {
        powerWp: targetPowerWp,
        ...elec,
        rawSnippet: text.slice(0, 400),
      };
    }
    return null;
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].row;
}

export function scoreExtraction(row: DatasheetPowerRow | null): number {
  if (!row) return 0;
  let n = 0;
  if (row.voc != null) n++;
  if (row.isc != null) n++;
  if (row.vmp != null) n++;
  if (row.imp != null) n++;
  return n / 4;
}
