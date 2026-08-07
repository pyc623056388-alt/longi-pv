/**
 * Generate Sydney CPD certificates by patching Brisbane Illustrator PDF template.
 * Usage: node scripts/generate-cpd-certificates.mjs
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { readdirSync } from "node:fs";

const PAGE_WIDTH = 595.276;
const NAME_SIZE = 32;
const NAME_Y = "510.177246";
const OLD_NAME = "Mark Thompson";
const OLD_DATE = "09/07/2026";
const NEW_DATE = "16/07/2026";
/** Certificate score is always 10 (unrelated to assessment marks). */

/** KSPF2 Times Bold Italic widths for FirstChar=32 .. printable ASCII */
const KSPF2_WIDTHS = [
  250, 389, 555, 500, 500, 833, 777, 277, 333, 333, 500, 569, 250, 333, 250, 277,
  500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 333, 333, 569, 569, 569, 500,
  832, 666, 666, 666, 722, 666, 666, 722, 777, 389, 500, 666, 610, 889, 722, 722,
  610, 722, 666, 556, 610, 722, 666, 889, 666, 610, 610, 333, 277, 333, 569, 500,
  333, 500, 500, 443, 500, 443, 333, 500, 556, 277, 277, 500, 277, 777, 556, 500,
  500, 500, 389, 389, 277, 556, 443, 666, 500, 443, 389, 348, 220, 348, 569,
];

const ATTENDEES = [
  { name: "Enjun Jing", file: "01-Enjun-Jing.pdf" },
  { name: "Guangzhen Zhang", file: "02-Guangzhen-Zhang.pdf" },
  { name: "Sunny", file: "03-Sunny.pdf" },
  { name: "Pengyu Nie", file: "04-Pengyu-Nie.pdf" },
  { name: "Archie", file: "05-Archie.pdf" },
  { name: "Junhang Luo", file: "06-Junhang-Luo.pdf" },
  { name: "Junkun You", file: "07-Junkun-You.pdf" },
  { name: "Yizhong Liang", file: "08-Yizhong-Liang.pdf" },
];

function textWidth(text, fontSize) {
  let units = 0;
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code < 32 || code > 32 + KSPF2_WIDTHS.length - 1) {
      throw new Error(`Unsupported char U+${code.toString(16)} in "${text}"`);
    }
    units += KSPF2_WIDTHS[code - 32];
  }
  return (units / 1000) * fontSize;
}

function centeredX(text, fontSize) {
  return PAGE_WIDTH / 2 - textWidth(text, fontSize) / 2;
}

function formatX(x) {
  return x.toFixed(6);
}

function findTemplatePath() {
  const certRoot = "G:\\My Drive\\Longi\\Training\\CPD\\Certification";
  const brisbane = readdirSync(certRoot, { withFileTypes: true }).find(
    (d) => d.isDirectory() && d.name.startsWith("20260709"),
  );
  if (!brisbane) throw new Error("Brisbane folder not found");
  const template = path.join(
    certRoot,
    brisbane.name,
    "certificates",
    "01-Mark-Thompson.pdf",
  );
  if (!fs.existsSync(template)) throw new Error(`Template missing: ${template}`);
  return template;
}

function findOutputDir() {
  return "G:\\My Drive\\Longi\\Training\\CPD\\Certification\\20260716-Sydney";
}

/**
 * Locate the FlateDecode content stream that contains the certificate text fields.
 * Returns { dictStart, lengthStart, lengthEnd, streamStart, streamEnd, rawStream }
 */
function findTextStream(pdf) {
  const marker = Buffer.from("[(Mark Thompson)] TJ");
  const markerAt = pdf.indexOf(marker);
  if (markerAt < 0) {
    // Marker is inside compressed stream — scan streams
  }

  const streamTag = Buffer.from("stream");
  const endTag = Buffer.from("endstream");
  let searchFrom = 0;
  while (searchFrom < pdf.length) {
    const streamIdx = pdf.indexOf(streamTag, searchFrom);
    if (streamIdx < 0) break;

    // Ensure it's the keyword "stream" not part of another word
    const before = streamIdx > 0 ? pdf[streamIdx - 1] : 0x0a;
    if (before !== 0x0a && before !== 0x0d && before !== 0x20) {
      searchFrom = streamIdx + 6;
      continue;
    }

    let dataStart = streamIdx + 6;
    if (pdf[dataStart] === 0x0d && pdf[dataStart + 1] === 0x0a) dataStart += 2;
    else if (pdf[dataStart] === 0x0a) dataStart += 1;

    const endIdx = pdf.indexOf(endTag, dataStart);
    if (endIdx < 0) break;

    let dataEnd = endIdx;
    // PDF allows optional EOL before endstream
    if (pdf[dataEnd - 1] === 0x0a) {
      dataEnd -= 1;
      if (pdf[dataEnd - 1] === 0x0d) dataEnd -= 1;
    }

    const rawStream = pdf.subarray(dataStart, dataEnd);
    let inflated;
    try {
      inflated = zlib.inflateSync(rawStream);
    } catch {
      searchFrom = endIdx + 9;
      continue;
    }

    if (inflated.includes(marker) || inflated.toString("latin1").includes(OLD_NAME)) {
      // Find /Length NNN preceding this stream
      const absWindowStart = Math.max(0, streamIdx - 200);
      const dictWindow = pdf.subarray(absWindowStart, streamIdx).toString("latin1");
      const lenMatch = [...dictWindow.matchAll(/\/Length\s+(\d+)/g)].pop();
      if (!lenMatch) throw new Error("Could not find /Length for text stream");
      const lengthValueStart =
        absWindowStart + dictWindow.lastIndexOf(lenMatch[0]) + "/Length ".length;
      const lengthValueEnd = lengthValueStart + lenMatch[1].length;

      return {
        streamStart: dataStart,
        streamEnd: dataEnd,
        rawStream,
        inflated,
        lengthValueStart,
        lengthValueEnd,
        oldLength: Number(lenMatch[1]),
      };
    }
    searchFrom = endIdx + 9;
  }
  throw new Error("Certificate text content stream not found");
}

function patchContent(inflated, attendee) {
  let text = inflated.toString("latin1");
  const nameX = formatX(centeredX(attendee.name, NAME_SIZE));

  // Name: update Tm X and TJ string (score stays 10 from template)
  const nameRe =
    /(\/KSPF2 1\.00 Tf\r?\n)32 0 0 32 [\d.]+ 510\.177246 {2}Tm(\r?\n0\.698 0\.510 0\.278 rg\r?\n0\.698 0\.510 0\.278 RG\r?\n)\[\((?:Mark Thompson)\)\] TJ/;
  if (!nameRe.test(text)) {
    throw new Error("Name block pattern not found");
  }
  text = text.replace(
    nameRe,
    `$132 0 0 32 ${nameX} ${NAME_Y}  Tm$2[(${attendee.name})] TJ`,
  );

  // Date
  if (!text.includes(`[(${OLD_DATE})] TJ`)) {
    throw new Error("Date string not found");
  }
  text = text.replace(`[(${OLD_DATE})] TJ`, `[(${NEW_DATE})] TJ`);

  return Buffer.from(text, "latin1");
}

function rebuildPdf(pdf, streamInfo, newInflated) {
  const compressed = zlib.deflateSync(newInflated);
  const lengthStr = String(compressed.length);

  // Replace Length value — pad/shrink carefully by rebuilding around stream
  const beforeLength = pdf.subarray(0, streamInfo.lengthValueStart);
  const afterLength = pdf.subarray(streamInfo.lengthValueEnd, streamInfo.streamStart);
  const afterStream = pdf.subarray(streamInfo.streamEnd);

  return Buffer.concat([
    beforeLength,
    Buffer.from(lengthStr, "ascii"),
    afterLength,
    compressed,
    afterStream,
  ]);
}

function patchMetadata(pdf) {
  let buf = pdf;
  const replacements = [
    ["20260709", "20260716"],
  ];
  for (const [from, to] of replacements) {
    // Only replace standalone title-like occurrences (same length)
    const fromBuf = Buffer.from(from, "ascii");
    const toBuf = Buffer.from(to, "ascii");
    let idx = 0;
    const parts = [];
    let last = 0;
    while ((idx = buf.indexOf(fromBuf, last)) !== -1) {
      parts.push(buf.subarray(last, idx));
      parts.push(toBuf);
      last = idx + fromBuf.length;
    }
    parts.push(buf.subarray(last));
    buf = Buffer.concat(parts);
  }
  return buf;
}

function main() {
  const templatePath = findTemplatePath();
  const outDir = findOutputDir();
  fs.mkdirSync(outDir, { recursive: true });

  const template = fs.readFileSync(templatePath);
  const streamInfo = findTextStream(template);

  console.log(`Template: ${templatePath}`);
  console.log(`Output:   ${outDir}`);
  console.log(`Stream length: ${streamInfo.oldLength} -> inflated ${streamInfo.inflated.length}`);

  // Remove previously generated cert PDFs (wrong assessment scores / duplicates)
  for (const f of fs.readdirSync(outDir)) {
    if (f.toLowerCase().endsWith(".pdf")) {
      fs.unlinkSync(path.join(outDir, f));
    }
  }

  for (const attendee of ATTENDEES) {
    const patched = patchContent(streamInfo.inflated, attendee);
    let pdf = rebuildPdf(template, streamInfo, patched);
    pdf = patchMetadata(pdf);
    const outPath = path.join(outDir, attendee.file);
    fs.writeFileSync(outPath, pdf);
    console.log(`Wrote ${attendee.file}  (${attendee.name}, score=10, ${NEW_DATE})`);
  }
  console.log(`Done: ${ATTENDEES.length} certificates`);
}

main();
