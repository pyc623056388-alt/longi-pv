/** 共享：从 datasheet PDF 文本抽取指定功率档 STC 参数 */

export function parseNum(s) {
  if (s == null) return undefined;
  const n = parseFloat(String(s).replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

function extractValuesWithUnit(line, unit) {
  const re = unit === "V" ? /([\d.]+)\s*V/gi : /([\d.]+)\s*A/gi;
  const out = [];
  let m;
  while ((m = re.exec(line)) !== null) {
    out.push(parseNum(m[1]));
  }
  return out;
}

function extractPowersFromLine(line) {
  const out = [];
  const re = /(\d{3})\s*W/gi;
  let m;
  while ((m = re.exec(line)) !== null) {
    out.push(parseInt(m[1], 10));
  }
  return out;
}

/**
 * Canadian Solar 等：STC 表多列功率（465 W470 W475 W…）
 */
export function parseStcMultiColumnTable(text, targetPowerWp) {
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

    const rowDefs = [
      ["vmp", /Opt\.?\s*Operating Voltage\s*\(Vmp\)([^\n]+)/i, "V"],
      ["imp", /Opt\.?\s*Operating Current\s*\(Imp\)([^\n]+)/i, "A"],
      ["voc", /Open Circuit Voltage\s*\(Voc\)([^\n]+)/i, "V"],
      ["isc", /Short Circuit Current\s*\(Isc\)([^\n]+)/i, "A"],
    ];

    const row = { powerWp: powers[idx] ?? targetPowerWp };
    let ok = 0;
    for (const [key, re, unit] of rowDefs) {
      const m = block.match(re);
      if (!m) continue;
      const vals = extractValuesWithUnit(m[1], unit);
      if (vals[idx] != null) {
        row[key] = vals[idx];
        ok++;
      }
    }
    if (ok >= 3) return row;
  }
  return null;
}

/**
 * Risen 等：STC 段落后连续数值块（Pmax, Eff, Voc, Isc, Vmp, Imp）
 */
export function parseStcValueStack(text, targetPowerWp) {
  const stcIdx = text.search(/ELECTRICAL DATA\s*\(STC\)/i);
  if (stcIdx < 0) return null;
  const chunk = text.slice(stcIdx, stcIdx + 3500);
  if (!new RegExp(`\\b${targetPowerWp}\\b`).test(chunk)) return null;

  const nums = [];
  for (const line of chunk.split("\n")) {
    const t = line.trim().replace(/[^\d.]/g, "");
    if (!t || !/^[\d.]+$/.test(t)) continue;
    const n = parseNum(t);
    if (n != null && n > 1 && n < 200) nums.push(n);
  }

  const pIdx = nums.findIndex((n) => Math.round(n) === targetPowerWp);
  if (pIdx < 0 || nums.length < pIdx + 6) return null;

  // Risen 等：Pmax, Eff%, Voc, Isc, Vmp, Imp
  return {
    powerWp: targetPowerWp,
    voc: nums[pIdx + 2],
    isc: nums[pIdx + 3],
    vmp: nums[pIdx + 4],
    imp: nums[pIdx + 5],
  };
}

/** Jinko：行内 6 列 Pmax Vmp Imp Voc Isc Eff% */
export function parseSixColumnPowerRows(text, targetPowerWp) {
  const tolerance = 25;
  const re =
    /^(\d{3})\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*$/gm;
  const rows = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    rows.push({
      powerWp: parseInt(m[1], 10),
      vmp: parseNum(m[2]),
      imp: parseNum(m[3]),
      voc: parseNum(m[4]),
      isc: parseNum(m[5]),
    });
  }
  if (!rows.length) return null;
  let best = rows[0];
  let bestDiff = Math.abs(best.powerWp - targetPowerWp);
  for (const r of rows) {
    const d = Math.abs(r.powerWp - targetPowerWp);
    if (d < bestDiff) {
      best = r;
      bestDiff = d;
    }
  }
  if (bestDiff > tolerance) return null;
  return best;
}

/** TCL 等：欧式小数逗号、功率列粘连 Pmax450455460465470475 */
function parseEuDecimalList(s) {
  const out = [];
  const re = /(\d+),(\d+)/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    out.push(parseNum(`${m[1]}.${m[2]}`));
  }
  return out;
}

export function parseEuropeanMultiColumn(text, targetPowerWp) {
  const pmaxLine = text.match(/Pmax\s*\(W\)\s*([^\n]+)/i);
  if (!pmaxLine) return null;

  const powerStr = pmaxLine[1].replace(/\s/g, "");
  const powers = [];
  const powerRe = /(\d{3})/g;
  let pm;
  while ((pm = powerRe.exec(powerStr)) !== null) {
    const v = parseInt(pm[1], 10);
    if (v >= 400 && v <= 800) powers.push(v);
  }
  const idx = powers.indexOf(targetPowerWp);
  if (idx < 0) return null;

  const pickRow = (label, unit) => {
    const m = text.match(
      new RegExp(`${label}\\s*\\(${unit}\\)\\s*([^\\n]+)`, "i")
    );
    if (!m) return undefined;
    const vals = parseEuDecimalList(m[1]);
    return vals[idx];
  };

  return {
    powerWp: targetPowerWp,
    voc: pickRow("Voc", "V"),
    isc: pickRow("Isc", "A"),
    vmp: pickRow("Vmp", "V"),
    imp: pickRow("Imp", "A"),
  };
}

/**
 * Jinko 等：标签行后多列数值（无单位粘连）
 */
export function parseLabeledColumnTable(text, targetPowerWp) {
  const tolerance = 15;
  const labels = [
    ["pmax", /Maximum Power\s*-\s*Pmax\s*\[Wp\]/gi],
    ["vmp", /Maximum Power Voltage\s*-\s*Vmp\s*\[V\]/gi],
    ["imp", /Maximum Power Current\s*-\s*Imp\s*\[A\]/gi],
    ["voc", /Open-circuit Voltage\s*-\s*Voc\s*\[V\]/gi],
    ["isc", /Short-circuit Current\s*-\s*Isc\s*\[A\]/gi],
  ];

  const rows = {};
  for (const [key, re] of labels) {
    re.lastIndex = 0;
    const m = re.exec(text);
    if (!m) continue;
    const after = text.slice(m.index + m[0].length, m.index + m[0].length + 800);
    const nums = [...after.matchAll(/(\d{2,3}(?:\.\d+)?)/g)]
      .map((x) => parseNum(x[1]))
      .filter((n) => n != null && n > 1);
    rows[key] = nums;
  }

  if (!rows.pmax?.length) return null;
  let idx = rows.pmax.findIndex((p) => p === targetPowerWp);
  if (idx < 0) {
    idx = rows.pmax.findIndex((p) => Math.abs(p - targetPowerWp) <= tolerance);
  }
  if (idx < 0) return null;

  return {
    powerWp: rows.pmax[idx],
    vmp: rows.vmp?.[idx],
    imp: rows.imp?.[idx],
    voc: rows.voc?.[idx],
    isc: rows.isc?.[idx],
  };
}

export function extractDimensions(text) {
  const m = text.match(/(\d{3,4})\s*[×xˣ]\s*(\d{3,4})\s*[×xˣ]?\s*\d+/i);
  if (m) {
    return { lengthMm: parseNum(m[1]), widthMm: parseNum(m[2]) };
  }
  return {};
}

export function extractPmpTempCoef(text) {
  const m = text.match(
    /(?:Temperature Coefficient\s*\(Pmax\)|temperature coefficient \(Pmax\)|Coefficient of Pmax)[^\d-]*(-?0?\.\d+)\s*%/i
  );
  return m ? parseNum(m[1]) : undefined;
}

export function parseDatasheetText(text, targetPowerWp) {
  const parsers = [
    parseStcMultiColumnTable,
    parseSixColumnPowerRows,
    parseEuropeanMultiColumn,
    parseStcValueStack,
    parseLabeledColumnTable,
  ];

  for (const fn of parsers) {
    const row = fn(text, targetPowerWp);
    if (row && row.voc != null && row.isc != null && row.vmp != null && row.imp != null) {
      const dims = extractDimensions(text);
      return {
        ...row,
        ...dims,
        pmpTempCoef: extractPmpTempCoef(text),
        powerWp: row.powerWp ?? targetPowerWp,
      };
    }
  }

  const partial =
    parseStcMultiColumnTable(text, targetPowerWp) ||
    parseSixColumnPowerRows(text, targetPowerWp) ||
    parseEuropeanMultiColumn(text, targetPowerWp) ||
    parseStcValueStack(text, targetPowerWp) ||
    parseLabeledColumnTable(text, targetPowerWp);

  if (partial) {
    const dims = extractDimensions(text);
    return {
      ...partial,
      ...dims,
      pmpTempCoef: extractPmpTempCoef(text),
      powerWp: partial.powerWp ?? targetPowerWp,
    };
  }
  return null;
}

export function scoreExtraction(row) {
  if (!row) return 0;
  let n = 0;
  if (row.voc != null) n++;
  if (row.isc != null) n++;
  if (row.vmp != null) n++;
  if (row.imp != null) n++;
  return n / 4;
}
