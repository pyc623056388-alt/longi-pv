import type { WeatherRecord } from "../pv-types";
import { generateId } from "../data-store";
import { parseEpwMonthlyIrradianceKwhM2Day } from "../epw-irradiance";
import { stableWeatherId } from "../seed-id";
import { estimateYearlyHoursFromWeather } from "../weather-utils";

export interface ParseEpwOptions {
  stableId?: string;
  /** 友好显示名，覆盖 EPW 头中的原始站名 */
  displayName?: string;
  /** 友好地点，如「澳大利亚」 */
  displayLocation?: string;
}

/** 解析 EnergyPlus EPW，提取站点信息与 12 月水平面总辐照 */
export function parseEpwContent(
  content: string,
  options?: ParseEpwOptions
): WeatherRecord | null {
  const parsed = parseEpwMonthlyIrradianceKwhM2Day(content);
  if (!parsed) return null;

  const { header, monthlyIrradianceKwhM2Day } = parsed;
  const nameEn = options?.displayName ?? header.city;
  const locationEn =
    options?.displayLocation ??
    (header.country ? `${nameEn}, ${header.country}` : nameEn);

  const record: WeatherRecord = {
    id:
      options?.stableId ??
      stableWeatherId(header.city, header.country),
    name: nameEn,
    nameEn,
    location: locationEn,
    locationEn,
    lat: header.lat,
    lon: header.lon,
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
