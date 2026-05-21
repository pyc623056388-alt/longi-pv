import type { ModuleLibrary, ModuleRecord } from "../pv-types";
import { generateId } from "../data-store";

/** PVsyst .PAN 文件解析（移植自 1111111 FileImporter INI 逻辑，并扩展温度系数与衰减字段） */
export interface ParsedPanModule {
  manufacturer?: string;
  model?: string;
  partNumber?: string;
  pnom?: number;
  length?: number;
  width?: number;
  vmp?: number;
  imp?: number;
  voc?: number;
  isc?: number;
  pmpTempCoef?: number;
  firstYearDegradationPct?: number;
  annualDegradationPct?: number;
}

/** Pmp 温度系数字段优先级（不含 gamma——其为二极管 ideality factor） */
const PMP_TEMP_COEF_KEY_PRIORITY = [
  "mupmpreq",
  "mupmp",
  "tempcoeffpmp",
  "tempcoeffpmax",
  "rpmp",
  "rmpp",
] as const;

type PmpTempCoefKey = (typeof PMP_TEMP_COEF_KEY_PRIORITY)[number];

const PMP_TEMP_COEF_KEY_SET = new Set<string>(PMP_TEMP_COEF_KEY_PRIORITY);

/** 晶硅组件 Pmp 温度系数合理范围（%/°C，通常为负） */
export function isPlausiblePmpTempCoef(value: number): boolean {
  if (!Number.isFinite(value)) return false;
  if (value >= 0) return false;
  if (value < -1.5 || value > -0.01) return false;
  return true;
}

function pickPmpTempCoef(
  candidates: Partial<Record<PmpTempCoefKey, number>>
): number | undefined {
  for (const key of PMP_TEMP_COEF_KEY_PRIORITY) {
    const v = candidates[key];
    if (v !== undefined && isPlausiblePmpTempCoef(v)) return v;
  }
  return undefined;
}

function parseIniContent(content: string, type: "PAN"): ParsedPanModule | null {
  const lines = content.split("\n");
  const n: ParsedPanModule = {};
  const tempCoefCandidates: Partial<Record<PmpTempCoefKey, number>> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.substring(0, eq).trim().toLowerCase();
    const val = trimmed.substring(eq + 1).trim().replace(/"/g, "");
    const num = parseFloat(val);

    if (type === "PAN") {
      if (key === "manufacturer") n.manufacturer = val;
      else if (key === "model") n.model = val;
      else if (key === "partnumber" || key === "part_number" || key === "料号")
        n.partNumber = val;
      else if (key === "vmpp" || key === "vmp") n.vmp = num;
      else if (key === "impp" || key === "imp") n.imp = num;
      else if (key === "voc" || key === "vococ") n.voc = num;
      else if (key === "isc" || key === "iscc") n.isc = num;
      else if (key === "pnom" || key === "pmpp") n.pnom = num;
      else if (key === "height") n.length = 1000 * num;
      else if (key === "width") n.width = 1000 * num;
      else if (PMP_TEMP_COEF_KEY_SET.has(key) && Number.isFinite(num)) {
        tempCoefCandidates[key as PmpTempCoefKey] = num;
      } else if (
        key === "degradation" ||
        key === "lidloss" ||
        key === "firstyeardegrad" ||
        key === "degrad1" ||
        key === "efficiencylossyear1"
      ) {
        if (Number.isFinite(num)) n.firstYearDegradationPct = num;
      } else if (
        key === "degradationyear" ||
        key === "annualdegrad" ||
        key === "degrad2" ||
        key === "efficiencylossyear2"
      ) {
        if (Number.isFinite(num)) n.annualDegradationPct = num;
      }
    }
  }

  n.pmpTempCoef = pickPmpTempCoef(tempCoefCandidates);

  if (!n.model) {
    for (const line of lines) {
      const t = line.trim();
      if (t.startsWith("Name=") || t.startsWith("name=")) {
        n.model = t.split("=")[1]?.trim().replace(/"/g, "");
        break;
      }
    }
  }

  if (!n.model || !n.pnom || !n.length || !n.width) return null;
  return n;
}

export function parsePanFileContent(
  content: string,
  library: ModuleLibrary
): ModuleRecord | null {
  const parsed = parseIniContent(content, "PAN");
  if (!parsed || !parsed.model || !parsed.pnom) return null;

  return {
    id: generateId("mod"),
    manufacturer: parsed.manufacturer || "Custom",
    model: parsed.model,
    powerWp: parsed.pnom,
    lengthMm: parsed.length,
    widthMm: parsed.width,
    pmpTempCoef: parsed.pmpTempCoef,
    firstYearDegradationPct: parsed.firstYearDegradationPct,
    annualDegradationPct: parsed.annualDegradationPct,
    library,
    source: "pan",
  };
}

export async function parsePanFile(
  file: File,
  library: ModuleLibrary
): Promise<ModuleRecord | null> {
  const text = await file.text();
  return parsePanFileContent(text, library);
}

export function validateModuleMinimal(m: ModuleRecord): string[] {
  const errors: string[] = [];
  if (!m.model?.trim()) errors.push("型号不能为空");
  if (!m.powerWp || m.powerWp <= 0) errors.push("功率无效");
  return errors;
}

export function validateModuleForStorage(m: ModuleRecord): string[] {
  const errors = validateModuleMinimal(m);
  if (m.pmpTempCoef === undefined || m.pmpTempCoef === null)
    errors.push("缺少 Pmp 温度系数");
  if (m.firstYearDegradationPct === undefined)
    errors.push("缺少首年衰减");
  if (m.annualDegradationPct === undefined) errors.push("缺少年衰减");
  return errors;
}
