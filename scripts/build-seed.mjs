/**
 * 从 数据库/longi PAN、datasheet review、EPW 生成 lib/seed-data.json
 * 运行: npm run extract:datasheet && npm run build:seed
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PAN_LONGI = path.join(ROOT, "数据库/longi");
const CURATION_FILE = path.join(__dirname, "module-curation.json");
const LONGI_CATALOG_FILE = path.join(__dirname, "longi-product-catalog.json");
const LONGI_MANUFACTURER = "LONGi Solar";
const DATASHEET_REVIEW = path.join(ROOT, "data/builtin/datasheet-extract-review.json");
const DATASHEET_OVERRIDES = path.join(ROOT, "data/builtin/datasheet-overrides.json");
const DATASHEET_SOURCES = path.join(__dirname, "datasheet-sources.json");
const EPW_DIR = path.join(ROOT, "data/builtin/weather/epw");
const STATIONS_FILE = path.join(ROOT, "scripts/epw-stations-au-nz.json");
const OUT_SEED = path.join(ROOT, "lib/seed-data.json");
const OUT_MANIFEST = path.join(ROOT, "data/builtin/manifest.json");

const DAYS_PER_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const GLOBAL_HORIZ_RAD_INDEX = 13;

function loadStationMetaById() {
  const map = new Map();
  if (!fs.existsSync(STATIONS_FILE)) return map;
  const { stations } = JSON.parse(fs.readFileSync(STATIONS_FILE, "utf8"));
  for (const s of stations) {
    map.set(s.id, s);
  }
  return map;
}

function countryLabel(code) {
  if (code === "NZL") return "新西兰";
  return "澳大利亚";
}

function countryLabelEn(code) {
  if (code === "NZL") return "New Zealand";
  return "Australia";
}

function splitBilingualLabel(label) {
  const trimmed = String(label).trim();
  const match = trimmed.match(
    /^([\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\s]+?)\s+([A-Za-z].*)$/
  );
  if (match) return { zh: match[1].trim(), en: match[2].trim() };
  if (/[\u4e00-\u9fff]/.test(trimmed) && !/[A-Za-z]{2,}/.test(trimmed)) {
    return { zh: trimmed };
  }
  return { en: trimmed };
}

const PMP_TEMP_COEF_KEY_PRIORITY = [
  "mupmpreq",
  "mupmp",
  "tempcoeffpmp",
  "tempcoeffpmax",
  "rpmp",
  "rmpp",
];
const PMP_TEMP_COEF_KEY_SET = new Set(PMP_TEMP_COEF_KEY_PRIORITY);

function isPlausiblePmpTempCoef(value) {
  if (!Number.isFinite(value)) return false;
  if (value >= 0) return false;
  if (value < -1.5 || value > -0.01) return false;
  return true;
}

function pickPmpTempCoef(candidates) {
  for (const key of PMP_TEMP_COEF_KEY_PRIORITY) {
    const v = candidates[key];
    if (v !== undefined && isPlausiblePmpTempCoef(v)) return v;
  }
  return undefined;
}

function inferCellCount(model, nCelS) {
  if (Number.isFinite(nCelS) && nCelS > 0) return Math.round(nCelS);
  const m = String(model || "").match(/lr\d+[-_]?(\d{2})/i);
  if (m) return parseInt(m[1], 10);
  return null;
}

function inferFamilyFromModel(model) {
  const m = String(model || "").toUpperCase();
  if (m.includes("HVHL")) return "hvhl";
  if (m.includes("HVB") || m.includes("HVHF") || m.includes("HVH")) return "hvh";
  if (m.includes("HVDF") || m.includes("HVD")) return "hvd";
  return null;
}

function powerRuleForCell(rules, cellCount) {
  return rules.find((r) => r.cellCount === cellCount);
}

function parsePanIni(content) {
  const lines = content.split("\n");
  const n = {};
  const tempCoefCandidates = {};
  let pvsystVersion = null;

  for (const line of lines) {
    const trimmed = line.trim();
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.substring(0, eq).trim().toLowerCase();
    const val = trimmed.substring(eq + 1).trim().replace(/"/g, "");
    const num = parseFloat(val);

    if (key === "version" && !pvsystVersion) {
      pvsystVersion = num;
    }
    if (key === "manufacturer") n.manufacturer = val;
    else if (key === "model") n.model = val;
    else if (key === "ncels") n.nCelS = num;
    else if (key === "vmpp" || key === "vmp") n.vmp = num;
    else if (key === "impp" || key === "imp") n.imp = num;
    else if (key === "voc" || key === "vococ") n.voc = num;
    else if (key === "isc" || key === "iscc") n.isc = num;
    else if (key === "pnom" || key === "pmpp") n.pnom = num;
    else if (key === "height") n.length = 1000 * num;
    else if (key === "width") n.width = 1000 * num;
    else if (PMP_TEMP_COEF_KEY_SET.has(key) && Number.isFinite(num)) {
      tempCoefCandidates[key] = num;
    } else if (
      ["degradation", "lidloss", "firstyeardegrad", "degrad1", "efficiencylossyear1"].includes(
        key
      )
    ) {
      if (Number.isFinite(num)) n.firstYearDegradationPct = num;
    } else if (
      ["degradationyear", "annualdegrad", "degrad2", "efficiencylossyear2"].includes(key)
    ) {
      if (Number.isFinite(num)) n.annualDegradationPct = num;
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
  return { ...n, pvsystVersion };
}

function matchesLongiCuration(parsed, rules) {
  const cellCount = inferCellCount(parsed.model, parsed.nCelS);
  if (cellCount == null) return { ok: false, reason: "unknown_cell_count" };
  const rule = rules.find((r) => r.cellCount === cellCount);
  if (!rule) return { ok: false, reason: `no_rule_for_${cellCount}_cells` };
  if (Math.round(parsed.pnom) !== rule.powerWp) {
    return {
      ok: false,
      reason: `power_${Math.round(parsed.pnom)}_not_${rule.powerWp}_for_${cellCount}cells`,
    };
  }
  return { ok: true, cellCount };
}

function slugPart(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
}

function stableModuleId(library, manufacturer, model) {
  return `mod_${library}_${slugPart(manufacturer)}_${slugPart(model)}`;
}

function estimateYearlyHours(monthly) {
  if (!monthly || monthly.length < 12) return 1500;
  let annualKwhPerM2 = 0;
  for (let i = 0; i < 12; i++) {
    annualKwhPerM2 += (monthly[i] ?? 0) * DAYS_PER_MONTH[i];
  }
  return Math.round(annualKwhPerM2 * 0.82);
}

function parseEpwContent(content, stationMeta) {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 10) return null;

  const header = lines[0].split(",");
  const city = header[1]?.trim() || stationMeta?.id || "EPW Site";
  const epwCountry = header[3]?.trim() || "";
  const lat = parseFloat(header[6] ?? "");
  const lon = parseFloat(header[7] ?? "");

  const monthlyTotals = new Array(12).fill(0);

  for (let i = 8; i < lines.length; i++) {
    const parts = lines[i].split(",");
    if (parts.length < 14) continue;
    if (!/^\d{4}$/.test(parts[0]?.trim() ?? "")) continue;
    const month = parseInt(parts[1], 10);
    if (month < 1 || month > 12) continue;
    const horizWh = parseFloat(parts[GLOBAL_HORIZ_RAD_INDEX]);
    if (!Number.isFinite(horizWh)) continue;
    monthlyTotals[month - 1] += horizWh / 1000;
  }

  const monthlyIrradianceKwhM2Day = monthlyTotals.map((total, idx) => {
    const days = DAYS_PER_MONTH[idx];
    return Math.round((total / days) * 100) / 100;
  });

  const label = stationMeta?.label ?? city;
  const countryCode = stationMeta?.country ?? epwCountry;
  const { zh: nameZh, en: nameEn } = splitBilingualLabel(label);
  const countryZh = countryLabel(countryCode);
  const countryEn = countryLabelEn(countryCode);
  const locationZh = `${nameZh ?? label}, ${countryZh}`;
  const locationEn = `${nameEn ?? label}, ${countryEn}`;
  const location = `${label}, ${countryZh}`;
  const stationId = stationMeta?.id ?? slugPart(city);

  const record = {
    id: `wx_${slugPart(stationId)}`,
    name: label,
    nameZh,
    nameEn,
    location,
    locationZh,
    locationEn,
    countryCode: countryCode === "NZL" ? "NZL" : "AUS",
    lat: Number.isFinite(lat) ? lat : undefined,
    lon: Number.isFinite(lon) ? lon : undefined,
    monthlyIrradianceKwhM2Day,
    source: "epw",
  };
  record.yearlyEquivalentHours = estimateYearlyHours(monthlyIrradianceKwhM2Day);
  return record;
}

function walkPanFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkPanFiles(full));
    else if (/\.pan$/i.test(ent.name) && !/\.7z$/i.test(ent.name)) out.push(full);
  }
  return out;
}

function moduleKey(manufacturer, model) {
  return `${(manufacturer || "").toLowerCase()}|${(model || "").toLowerCase()}`;
}

function panToRecord(parsed, library, overrides = {}) {
  const manufacturer = overrides.manufacturer ?? parsed.manufacturer ?? "Custom";
  const model = overrides.model ?? parsed.model;
  return {
    id: stableModuleId(library, manufacturer, model),
    manufacturer,
    model,
    powerWp: overrides.powerWp ?? parsed.pnom,
    lengthMm: overrides.lengthMm ?? parsed.length,
    widthMm: overrides.widthMm ?? parsed.width,
    voc: parsed.voc,
    isc: parsed.isc,
    vmp: parsed.vmp,
    imp: parsed.imp,
    pmpTempCoef: parsed.pmpTempCoef,
    firstYearDegradationPct: parsed.firstYearDegradationPct,
    annualDegradationPct: parsed.annualDegradationPct,
    library,
    source: overrides.source ?? "pan",
  };
}

/** Scan all PAN files into template pool (by family / cell / power). */
function scanLongiPanPool(dir, curation) {
  const { minVersion = 7.2 } = curation.longi ?? {};
  const pool = [];
  const rejected = [];

  for (const filePath of walkPanFiles(dir)) {
    const content = fs.readFileSync(filePath, "utf8");
    const parsed = parsePanIni(content);
    if (!parsed) {
      rejected.push({ file: path.relative(ROOT, filePath), reason: "parse_failed" });
      continue;
    }
    if (parsed.pvsystVersion != null && parsed.pvsystVersion < minVersion) {
      rejected.push({
        file: path.relative(ROOT, filePath),
        reason: `version_${parsed.pvsystVersion}_lt_${minVersion}`,
      });
      continue;
    }
    const cellCount = inferCellCount(parsed.model, parsed.nCelS);
    const family = inferFamilyFromModel(parsed.model);
    if (cellCount == null || !family) {
      rejected.push({
        file: path.relative(ROOT, filePath),
        reason: "unknown_family_or_cell_count",
        model: parsed.model,
      });
      continue;
    }
    pool.push({
      parsed,
      file: path.relative(ROOT, filePath),
      cellCount,
      family,
      powerWp: Math.round(parsed.pnom),
    });
  }

  return { pool, rejected };
}

function templateScore(entry, targetCell, targetPower) {
  const cellDiff = Math.abs(entry.cellCount - targetCell);
  const powerDiff = Math.abs(entry.powerWp - targetPower);
  return cellDiff * 1000 + powerDiff;
}

function findPanTemplate(pool, family, cellCount, targetPower, exactModel) {
  if (exactModel) {
    const exact = pool.find(
      (e) => e.family === family && e.parsed.model.toLowerCase() === exactModel.toLowerCase()
    );
    if (exact) return exact;
  }

  const candidates = pool.filter((e) => e.family === family);
  if (!candidates.length) return null;

  const sameCell = candidates.filter((e) => e.cellCount === cellCount);
  const search = sameCell.length ? sameCell : candidates;
  let best = null;
  let bestScore = Infinity;
  for (const e of search) {
    const score = templateScore(e, cellCount, targetPower);
    if (score < bestScore) {
      bestScore = score;
      best = e;
    }
  }
  return best;
}

function loadLongiCatalog() {
  if (!fs.existsSync(LONGI_CATALOG_FILE)) {
    throw new Error(`Missing ${LONGI_CATALOG_FILE}`);
  }
  const data = JSON.parse(fs.readFileSync(LONGI_CATALOG_FILE, "utf8"));
  return {
    manufacturer: data.manufacturer ?? LONGI_MANUFACTURER,
    products: data.products ?? [],
  };
}

function buildLongiFromCatalog(dir, curation) {
  const { cellPowerRules = [] } = curation.longi ?? {};
  const catalog = loadLongiCatalog();
  const { pool, rejected: scanRejected } = scanLongiPanPool(dir, curation);
  const accepted = [];
  const modules = [];
  const errors = [];

  for (const product of catalog.products) {
    const rule = powerRuleForCell(cellPowerRules, product.cellCount);
    if (!rule || rule.powerWp !== product.powerWp) {
      errors.push({
        model: product.model,
        reason: `catalog_power_mismatch_${product.powerWp}`,
      });
      continue;
    }

    const template = findPanTemplate(
      pool,
      product.family,
      product.cellCount,
      product.powerWp,
      null
    );

    if (!template) {
      errors.push({ model: product.model, reason: `no_pan_template_for_${product.family}` });
      continue;
    }

    const synthesized = template.parsed.model !== product.model;
    const record = panToRecord(template.parsed, "longi", {
      manufacturer: catalog.manufacturer,
      model: product.model,
      powerWp: product.powerWp,
      lengthMm: product.lengthMm,
      widthMm: product.widthMm,
      source: synthesized ? "pan_synthesized" : "pan",
    });

    modules.push(record);
    accepted.push({
      model: product.model,
      powerWp: product.powerWp,
      family: product.family,
      file: template.file,
      synthesized,
      templateModel: synthesized ? template.parsed.model : undefined,
    });
  }

  modules.sort((a, b) => b.powerWp - a.powerWp || a.model.localeCompare(b.model));

  return {
    modules,
    rejected: scanRejected,
    skipped: [],
    duplicatesResolved: 0,
    accepted,
    errors,
    filtered: true,
    catalogCount: catalog.products.length,
  };
}

function loadDatasheetSourceMeta() {
  const map = new Map();
  if (!fs.existsSync(DATASHEET_SOURCES)) return map;
  const { sources } = JSON.parse(fs.readFileSync(DATASHEET_SOURCES, "utf8"));
  for (const s of sources) {
    map.set(`${s.file}|${s.model}|${s.targetPowerWp}`, s);
  }
  return map;
}

function datasheetEntryToRecord(e, sourceMeta) {
  const meta = sourceMeta.get(`${e.file}|${e.model}|${e.targetPowerWp}`);
  const manufacturer = e.manufacturer ?? meta?.manufacturer ?? "竞品";
  return {
    id: stableModuleId("competitor", manufacturer, e.model),
    manufacturer,
    model: e.model,
    powerWp: e.targetPowerWp,
    lengthMm: e.lengthMm,
    widthMm: e.widthMm,
    voc: e.voc,
    isc: e.isc,
    vmp: e.vmp,
    imp: e.imp,
    pmpTempCoef: e.pmpTempCoef,
    firstYearDegradationPct: e.firstYearDegradationPct ?? 1,
    annualDegradationPct: e.annualDegradationPct ?? 0.4,
    library: "competitor",
    source: "datasheet",
    segment: e.segment ?? meta?.segment,
  };
}

function mergeApprovedOverrides(modules, sourceMeta) {
  if (!fs.existsSync(DATASHEET_OVERRIDES)) return modules;
  const { entries } = JSON.parse(fs.readFileSync(DATASHEET_OVERRIDES, "utf8"));
  const byId = new Map(modules.map((m) => [m.id, m]));

  for (const o of entries || []) {
    if (o.status !== "approved") continue;
    const meta = sourceMeta.get(`${o.file}|${o.model}|${o.targetPowerWp}`);
    const record = datasheetEntryToRecord(
      {
        ...o,
        manufacturer: o.manufacturer ?? meta?.manufacturer,
        segment: o.segment ?? meta?.segment,
      },
      sourceMeta
    );
    byId.set(record.id, { ...byId.get(record.id), ...record });
  }

  return [...byId.values()].sort(
    (a, b) => b.powerWp - a.powerWp || a.model.localeCompare(b.model)
  );
}

function ingestCompetitorFromReview(reviewPath, onlyApproved) {
  const rejected = [];
  const modules = [];

  if (!fs.existsSync(reviewPath)) {
    return {
      modules: [],
      rejected: [{ reason: "review_file_missing", file: reviewPath }],
      approved: 0,
      pending: 0,
    };
  }

  const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
  const sourceMeta = loadDatasheetSourceMeta();
  let approved = 0;
  let pending = 0;

  for (const e of review.entries || []) {
    if (e.status === "pending") pending++;
    if (onlyApproved && e.status !== "approved") {
      if (e.status !== "rejected") {
        rejected.push({
          file: e.file,
          model: e.model,
          reason: `status_${e.status}`,
        });
      }
      continue;
    }
    if (e.status === "rejected") continue;
    approved++;

    modules.push(datasheetEntryToRecord(e, sourceMeta));
  }

  const merged = mergeApprovedOverrides(modules, sourceMeta);

  return {
    modules: merged,
    rejected,
    approved,
    pending,
    reviewGeneratedAt: review.generatedAt,
  };
}

function ingestEpwDir(dir) {
  const records = [];
  const failed = [];
  const stationById = loadStationMetaById();
  if (!fs.existsSync(dir)) return { records, failed };

  for (const name of fs.readdirSync(dir)) {
    if (!/\.epw$/i.test(name)) continue;
    const full = path.join(dir, name);
    const content = fs.readFileSync(full, "utf8");
    const m = name.match(/^AUS_(.+)\.epw$/i);
    const stationId = m ? m[1] : name.replace(/\.epw$/i, "");
    const meta = stationById.get(stationId) ?? {
      id: stationId,
      label: stationId,
      country: "AUS",
    };
    const wx = parseEpwContent(content, meta);
    if (wx) records.push(wx);
    else failed.push(name);
  }

  const byId = new Map();
  for (const w of records) {
    byId.set(w.id, w);
  }
  return { records: [...byId.values()].sort((a, b) => a.name.localeCompare(b.name)), failed };
}

function main() {
  const curation = JSON.parse(fs.readFileSync(CURATION_FILE, "utf8"));
  const longiResult = buildLongiFromCatalog(PAN_LONGI, curation);
  const reviewPath = path.join(ROOT, curation.competitor?.reviewFile ?? DATASHEET_REVIEW);
  let compResult = ingestCompetitorFromReview(
    reviewPath,
    curation.competitor?.onlyApproved !== false
  );
  if (compResult.modules.length === 0 && fs.existsSync(DATASHEET_OVERRIDES)) {
    const sourceMeta = loadDatasheetSourceMeta();
    const { entries } = JSON.parse(fs.readFileSync(DATASHEET_OVERRIDES, "utf8"));
    const mods = (entries || [])
      .filter((e) => e.status === "approved")
      .map((e) =>
        datasheetEntryToRecord(
          {
            ...e,
            manufacturer: e.manufacturer ?? sourceMeta.get(`${e.file}|${e.model}|${e.targetPowerWp}`)?.manufacturer,
            segment: e.segment ?? sourceMeta.get(`${e.file}|${e.model}|${e.targetPowerWp}`)?.segment,
          },
          sourceMeta
        )
      );
    compResult = {
      modules: mods,
      rejected: [],
      approved: mods.length,
      pending: 0,
      reviewGeneratedAt: null,
      fromOverridesOnly: true,
    };
  }
  const epwResult = ingestEpwDir(EPW_DIR);

  const seed = {
    longiModules: longiResult.modules,
    competitorModules: compResult.modules,
    weather:
      epwResult.records.length > 0
        ? epwResult.records
        : [
            {
              id: "wx_sydney_au",
              name: "Sydney",
              location: "Sydney, Australia",
              lat: -33.87,
              lon: 151.21,
              monthlyIrradianceKwhM2Day: [
                5.2, 4.8, 4.2, 3.5, 2.8, 2.4, 2.5, 3.2, 4.0, 4.8, 5.2, 5.5,
              ],
              yearlyEquivalentHours: 1550,
              source: "manual",
            },
          ],
  };

  fs.writeFileSync(OUT_SEED, `${JSON.stringify(seed, null, 2)}\n`, "utf8");

  const manifest = {
    generatedAt: new Date().toISOString(),
    dataSource: {
      longiPan: "数据库/longi",
      competitor: "data/builtin/datasheet-extract-review.json",
    },
    longi: {
      count: longiResult.modules.length,
      catalogCount: longiResult.catalogCount,
      filtered: longiResult.filtered,
      accepted: longiResult.accepted,
      rejected: longiResult.rejected,
      skippedDuplicates: longiResult.skipped,
      catalogErrors: longiResult.errors,
    },
    competitor: {
      count: compResult.modules.length,
      fromDatasheet: true,
      approved: compResult.approved,
      pending: compResult.pending,
      rejected: compResult.rejected,
      reviewGeneratedAt: compResult.reviewGeneratedAt,
    },
    weather: {
      count: seed.weather.length,
      epwFiles: epwResult.records.length,
      epwFailed: epwResult.failed,
      placeholder: epwResult.records.length === 0,
    },
  };

  fs.mkdirSync(path.dirname(OUT_MANIFEST), { recursive: true });
  fs.writeFileSync(OUT_MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(
    `seed: longi=${longiResult.modules.length} competitor=${compResult.modules.length} weather=${seed.weather.length}`
  );
  if (longiResult.rejected.length)
    console.log(`longi pan scan rejected: ${longiResult.rejected.length}`);
  if (longiResult.errors?.length) {
    console.error("longi catalog errors:", longiResult.errors);
    process.exitCode = 1;
  }
  if (compResult.pending > 0)
    console.log(`competitor pending review: ${compResult.pending} (not in seed)`);
  if (epwResult.records.length === 0)
    console.log("weather: no EPW files — using Sydney placeholder; run npm run fetch:epw");
}

main();
