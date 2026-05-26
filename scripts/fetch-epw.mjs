/**
 * 下载澳新主流城市 TMYx EPW（climate.onebuilding.org）
 * 配置: scripts/epw-stations-au-nz.json
 * 用法: node scripts/fetch-epw.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import os from "os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const EPW_DIR = path.join(ROOT, "data", "builtin", "weather", "epw");
const STATIONS_FILE = path.join(__dirname, "epw-stations-au-nz.json");

const { regionBase, stations } = JSON.parse(
  fs.readFileSync(STATIONS_FILE, "utf8")
);

function findEpw(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      const nested = findEpw(full);
      if (nested) return nested;
    } else if (/\.epw$/i.test(name)) return full;
  }
  return null;
}

function unzip(zipPath, destDir) {
  if (process.platform === "win32") {
    const cmd = `powershell -NoProfile -Command "Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${destDir.replace(/'/g, "''")}' -Force"`;
    execSync(cmd, { stdio: "inherit" });
  } else {
    execSync(`unzip -o -q "${zipPath}" -d "${destDir}"`, { stdio: "inherit" });
  }
}

async function main() {
  fs.mkdirSync(EPW_DIR, { recursive: true });
  const failed = [];

  for (const station of stations) {
    const outFile = path.join(EPW_DIR, `AUS_${station.id}.epw`);
    if (fs.existsSync(outFile) && fs.statSync(outFile).size > 1000) {
      console.log(`skip ${station.label}`);
      continue;
    }
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "longi-epw-"));
    const zipPath = path.join(tmpDir, "weather.zip");
    const url = `${regionBase}/${station.dir}/${station.zip}`;
    try {
      console.log(`fetch ${station.label}...`);
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fs.writeFileSync(zipPath, Buffer.from(await res.arrayBuffer()));
      const extractDir = path.join(tmpDir, "out");
      fs.mkdirSync(extractDir, { recursive: true });
      unzip(zipPath, extractDir);
      const epwSrc = findEpw(extractDir);
      if (!epwSrc) throw new Error("no .epw in zip");
      fs.copyFileSync(epwSrc, outFile);
      console.log(`ok ${station.label}`);
    } catch (e) {
      failed.push({ station: station.label, id: station.id, url, error: String(e) });
      console.error(`fail ${station.label}:`, e.message ?? e);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }

  const failPath = path.join(ROOT, "data", "builtin", "epw-fetch-failures.json");
  if (failed.length) {
    fs.writeFileSync(failPath, JSON.stringify(failed, null, 2));
    console.log(`failures: ${failed.length} -> ${failPath}`);
    process.exitCode = 1;
  } else if (fs.existsSync(failPath)) fs.unlinkSync(failPath);

  console.log(`done: ${stations.length} configured, ${failed.length} failed`);
}

main();
