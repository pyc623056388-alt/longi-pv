/**
 * 从 数据库/竞品 PDF 抽取电参数，写入 data/builtin/datasheet-extract-review.json
 * 运行: npm run extract:datasheet
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { parseDatasheetText, scoreExtraction } from "./datasheet-parse.mjs";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SOURCES_FILE = path.join(__dirname, "datasheet-sources.json");
const OUT_REVIEW = path.join(ROOT, "data/builtin/datasheet-extract-review.json");
const OUT_CSV = path.join(ROOT, "data/builtin/datasheet-extract-review.csv");
const OVERRIDES_FILE = path.join(ROOT, "data/builtin/datasheet-overrides.json");

async function loadPdfText(filePath) {
  try {
    const pdfParse = require("pdf-parse");
    const buf = fs.readFileSync(filePath);
    const data = await pdfParse(buf);
    return data.text || "";
  } catch (e) {
    console.warn(`pdf-parse failed for ${filePath}: ${e.message}`);
    return "";
  }
}

function loadExistingReview() {
  if (!fs.existsSync(OUT_REVIEW)) return { entries: [] };
  return JSON.parse(fs.readFileSync(OUT_REVIEW, "utf8"));
}

function entryKey(e) {
  return `${e.file}|${e.model}|${e.targetPowerWp}`;
}

function loadOverrides() {
  if (!fs.existsSync(OVERRIDES_FILE)) return new Map();
  const { entries } = JSON.parse(fs.readFileSync(OVERRIDES_FILE, "utf8"));
  const map = new Map();
  for (const e of entries || []) {
    map.set(entryKey(e), e);
  }
  return map;
}

function applyOverride(entry, override) {
  if (!override) return entry;
  return {
    ...entry,
    voc: override.voc ?? entry.voc,
    isc: override.isc ?? entry.isc,
    vmp: override.vmp ?? entry.vmp,
    imp: override.imp ?? entry.imp,
    lengthMm: override.lengthMm ?? entry.lengthMm,
    widthMm: override.widthMm ?? entry.widthMm,
    pmpTempCoef: override.pmpTempCoef ?? entry.pmpTempCoef,
    firstYearDegradationPct:
      override.firstYearDegradationPct ?? entry.firstYearDegradationPct,
    annualDegradationPct:
      override.annualDegradationPct ?? entry.annualDegradationPct,
    status: override.status ?? entry.status,
    note: override.note,
    confidence: scoreExtraction({
      voc: override.voc ?? entry.voc,
      isc: override.isc ?? entry.isc,
      vmp: override.vmp ?? entry.vmp,
      imp: override.imp ?? entry.imp,
    }),
  };
}

async function mainAsync() {
  const config = JSON.parse(fs.readFileSync(SOURCES_FILE, "utf8"));
  const existing = loadExistingReview();
  const approvedByKey = new Map();
  for (const e of existing.entries || []) {
    if (e.status === "approved") approvedByKey.set(entryKey(e), e);
  }
  const overrides = loadOverrides();

  const outEntries = [];

  for (const src of config.sources) {
    const subdir = src.subdir === "utility" ? config.utilityDir : config.residentialDir;
    const filePath = path.join(ROOT, subdir, src.file);
    const key = entryKey({
      file: src.file,
      model: src.model,
      targetPowerWp: src.targetPowerWp,
    });

    if (!fs.existsSync(filePath)) {
      outEntries.push({
        file: src.file,
        manufacturer: src.manufacturer,
        model: src.model,
        segment: src.segment,
        targetPowerWp: src.targetPowerWp,
        status: "rejected",
        confidence: 0,
        error: "file_not_found",
      });
      continue;
    }

    const ov = overrides.get(key);
    if (ov?.status === "approved") {
      outEntries.push({
        file: src.file,
        manufacturer: src.manufacturer,
        model: src.model,
        segment: src.segment,
        targetPowerWp: src.targetPowerWp,
        voc: ov.voc,
        isc: ov.isc,
        vmp: ov.vmp,
        imp: ov.imp,
        lengthMm: ov.lengthMm,
        widthMm: ov.widthMm,
        pmpTempCoef: ov.pmpTempCoef,
        firstYearDegradationPct: ov.firstYearDegradationPct,
        annualDegradationPct: ov.annualDegradationPct,
        confidence: 1,
        status: "approved",
        note: ov.note,
      });
      continue;
    }

    const text = await loadPdfText(filePath);
    const row = parseDatasheetText(text, src.targetPowerWp);
    const confidence = scoreExtraction(row);
    const prev = approvedByKey.get(key);
    const status =
      prev?.status === "approved"
        ? "approved"
        : confidence >= 0.75
          ? "approved"
          : "pending";

    let entry = {
      file: src.file,
      manufacturer: src.manufacturer,
      model: src.model,
      segment: src.segment,
      targetPowerWp: src.targetPowerWp,
      voc: prev?.voc ?? row?.voc,
      isc: prev?.isc ?? row?.isc,
      vmp: prev?.vmp ?? row?.vmp,
      imp: prev?.imp ?? row?.imp,
      lengthMm: prev?.lengthMm ?? row?.lengthMm,
      widthMm: prev?.widthMm ?? row?.widthMm,
      pmpTempCoef: prev?.pmpTempCoef ?? row?.pmpTempCoef,
      firstYearDegradationPct: prev?.firstYearDegradationPct,
      annualDegradationPct: prev?.annualDegradationPct,
      confidence,
      status,
      rawSnippet: row?.rawSnippet?.slice(0, 300),
    };
    entry = applyOverride(entry, ov);
    if (entry.status === "approved" || entry.confidence >= 0.75) {
      entry.status = "approved";
    }
    outEntries.push(entry);
  }

  const review = {
    generatedAt: new Date().toISOString(),
    entries: outEntries,
  };
  fs.mkdirSync(path.dirname(OUT_REVIEW), { recursive: true });
  fs.writeFileSync(OUT_REVIEW, `${JSON.stringify(review, null, 2)}\n`, "utf8");

  const header =
    "file,manufacturer,model,segment,targetPowerWp,voc,isc,vmp,imp,confidence,status\n";
  const rows = outEntries
    .map((e) =>
      [
        e.file,
        e.manufacturer,
        e.model,
        e.segment,
        e.targetPowerWp,
        e.voc ?? "",
        e.isc ?? "",
        e.vmp ?? "",
        e.imp ?? "",
        e.confidence ?? "",
        e.status,
      ].join(",")
    )
    .join("\n");
  fs.writeFileSync(OUT_CSV, header + rows + "\n", "utf8");

  const approved = outEntries.filter((e) => e.status === "approved").length;
  const pending = outEntries.filter((e) => e.status === "pending").length;
  console.log(
    `datasheet review: ${outEntries.length} entries, approved=${approved}, pending=${pending}`
  );
  console.log(`wrote ${OUT_REVIEW}`);
}

mainAsync().catch((e) => {
  console.error(e);
  process.exit(1);
});
