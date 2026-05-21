import type { WeatherRecord } from "../pv-types";
import { generateId } from "../data-store";
import { estimateYearlyHoursFromWeather } from "../weather-utils";

const MONTH_NAMES = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

/** 解析 EnergyPlus EPW，提取站点信息与 12 月水平面总辐照 */
export function parseEpwContent(content: string): WeatherRecord | null {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 10) return null;

  const header = lines[0].split(",");
  const city = header[1]?.trim() || "EPW Site";
  const country = header[3]?.trim() || "";
  const lat = parseFloat(header[6] ?? "");
  const lon = parseFloat(header[7] ?? "");

  const monthlyTotals = new Array(12).fill(0);
  const monthlyCounts = new Array(12).fill(0);

  for (let i = 8; i < lines.length; i++) {
    const parts = lines[i].split(",");
    if (parts.length < 14) continue;
    const month = parseInt(parts[1], 10);
    if (month < 1 || month > 12) continue;
    const horizWh = parseFloat(parts[13]);
    if (!Number.isFinite(horizWh)) continue;
    monthlyTotals[month - 1] += horizWh / 1000;
    monthlyCounts[month - 1] += 1;
  }

  const monthlyIrradianceKwhM2Day: number[] = MONTH_NAMES.map((_, idx) => {
    const days = monthlyCounts[idx];
    if (days === 0) return 0;
    return Math.round((monthlyTotals[idx] / days) * 100) / 100;
  });

  const record: WeatherRecord = {
    id: generateId("wx"),
    name: city,
    location: country ? `${city}, ${country}` : city,
    lat: Number.isFinite(lat) ? lat : undefined,
    lon: Number.isFinite(lon) ? lon : undefined,
    monthlyIrradianceKwhM2Day,
    source: "epw",
  };

  record.yearlyEquivalentHours = estimateYearlyHoursFromWeather(record);
  return record;
}

export async function parseEpwFile(file: File): Promise<WeatherRecord | null> {
  const text = await file.text();
  return parseEpwContent(text);
}
