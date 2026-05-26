/** 从 EPW 小时数据计算 12 个月水平面日均辐照（kWh/m²·日） */
export const DAYS_PER_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

const GLOBAL_HORIZ_RAD_INDEX = 13;

export interface EpwHeaderInfo {
  city: string;
  country: string;
  lat?: number;
  lon?: number;
}

export function parseEpwHeader(lines: string[]): EpwHeaderInfo | null {
  if (!lines.length) return null;
  const header = lines[0].split(",");
  const city = header[1]?.trim() || "EPW Site";
  const country = header[3]?.trim() || "";
  const lat = parseFloat(header[6] ?? "");
  const lon = parseFloat(header[7] ?? "");
  return {
    city,
    country,
    lat: Number.isFinite(lat) ? lat : undefined,
    lon: Number.isFinite(lon) ? lon : undefined,
  };
}

/** 仅解析数据行（首字段为 4 位年份） */
export function parseEpwMonthlyIrradianceKwhM2Day(
  content: string
): { header: EpwHeaderInfo; monthlyIrradianceKwhM2Day: number[] } | null {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 10) return null;

  const header = parseEpwHeader(lines);
  if (!header) return null;

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
    const days = DAYS_PER_MONTH[idx]!;
    return Math.round((total / days) * 100) / 100;
  });

  return { header, monthlyIrradianceKwhM2Day };
}
