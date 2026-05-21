import type { ModuleLibrary, ModuleRecord } from "../pv-types";
import { generateId } from "../data-store";

const HEADER_ALIASES: Record<string, keyof ModuleRecord | "power" | "temp" | "fy" | "annual"> = {
  manufacturer: "manufacturer",
  制造商: "manufacturer",
  厂家: "manufacturer",
  model: "model",
  型号: "model",
  power: "power",
  powerwp: "power",
  功率: "power",
  wp: "power",
  length: "lengthMm",
  长度: "lengthMm",
  width: "widthMm",
  宽度: "widthMm",
  pmptempcoef: "temp",
  pmp温度系数: "temp",
  温度系数: "temp",
  tempcoef: "temp",
  firstyeardegradation: "fy",
  首年衰减: "fy",
  annualdegradation: "annual",
  年衰减: "annual",
  priceperw: "pricePerW",
  单价: "pricePerW",
  price: "pricePerW",
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[\s_%/()-]+/g, "");
}

function parseDelimitedLine(line: string, delimiter: string): string[] {
  return line.split(delimiter).map((c) => c.trim().replace(/^"|"$/g, ""));
}

function detectDelimiter(firstLine: string): string {
  if (firstLine.includes("\t")) return "\t";
  if (firstLine.split(";").length > firstLine.split(",").length) return ";";
  return ",";
}

export function parseCsvContent(
  content: string,
  library: ModuleLibrary
): ModuleRecord[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseDelimitedLine(lines[0], delimiter).map(normalizeHeader);
  const colMap: Record<number, string> = {};
  headers.forEach((h, i) => {
    const alias = HEADER_ALIASES[h];
    if (alias) colMap[i] = alias;
  });

  const results: ModuleRecord[] = [];

  for (let r = 1; r < lines.length; r++) {
    const cells = parseDelimitedLine(lines[r], delimiter);
    if (cells.every((c) => !c)) continue;

    const row: Record<string, string> = {};
    Object.entries(colMap).forEach(([idx, field]) => {
      row[field] = cells[Number(idx)] ?? "";
    });

    const power = parseFloat(row.power ?? "");
    if (!Number.isFinite(power) || power <= 0) continue;

    const manufacturer = row.manufacturer || "Unknown";
    const model = row.model || `Module-${r}`;

    results.push({
      id: generateId("mod"),
      manufacturer,
      model,
      powerWp: power,
      lengthMm: row.lengthMm ? parseFloat(row.lengthMm) : undefined,
      widthMm: row.widthMm ? parseFloat(row.widthMm) : undefined,
      pmpTempCoef: row.temp ? parseFloat(row.temp) : undefined,
      firstYearDegradationPct: row.fy ? parseFloat(row.fy) : undefined,
      annualDegradationPct: row.annual ? parseFloat(row.annual) : undefined,
      pricePerW: row.pricePerW ? parseFloat(row.pricePerW) : undefined,
      library,
      source: "csv",
    });
  }

  return results;
}

export async function parseSpreadsheetFile(
  file: File,
  library: ModuleLibrary
): Promise<ModuleRecord[]> {
  const name = file.name.toLowerCase();
  const text = await file.text();
  if (name.endsWith(".csv") || name.endsWith(".tsv") || name.endsWith(".txt")) {
    return parseCsvContent(text, library);
  }
  return parseCsvContent(text, library);
}
