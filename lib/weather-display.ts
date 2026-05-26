import type { AppLocale } from "./i18n/types";
import type { WeatherRecord } from "./pv-types";

export interface BilingualParts {
  zh?: string;
  en?: string;
}

/** Split "阿德莱德 Adelaide" into zh/en segments */
export function splitBilingualLabel(label: string): BilingualParts {
  const trimmed = label.trim();
  if (!trimmed) return {};

  const match = trimmed.match(
    /^([\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\s]+?)\s+([A-Za-z].*)$/
  );
  if (match) {
    return { zh: match[1]!.trim(), en: match[2]!.trim() };
  }

  const hasCjk = /[\u4e00-\u9fff]/.test(trimmed);
  const hasLatin = /[A-Za-z]{2,}/.test(trimmed);
  if (hasCjk && !hasLatin) return { zh: trimmed };
  if (hasLatin && !hasCjk) return { en: trimmed };
  return { en: trimmed };
}

export function countryName(
  code: string | undefined,
  locale: AppLocale
): string {
  if (code === "NZL") return locale === "zh" ? "新西兰" : "New Zealand";
  if (code === "AUS") return locale === "zh" ? "澳大利亚" : "Australia";
  return "";
}

function resolvedNameParts(record: WeatherRecord): BilingualParts {
  if (record.nameZh || record.nameEn) {
    return { zh: record.nameZh, en: record.nameEn };
  }
  return splitBilingualLabel(record.name);
}

function resolvedLocationParts(record: WeatherRecord): BilingualParts {
  if (record.locationZh || record.locationEn) {
    return { zh: record.locationZh, en: record.locationEn };
  }
  if (!record.location) return {};

  const comma = record.location.lastIndexOf(",");
  if (comma < 0) return splitBilingualLabel(record.location);

  const placePart = record.location.slice(0, comma).trim();
  const countryPart = record.location.slice(comma + 1).trim();
  const place = splitBilingualLabel(placePart);
  const countryZh =
    countryPart.includes("新西兰") || countryPart.includes("New Zealand")
      ? { zh: "新西兰", en: "New Zealand" }
      : countryPart.includes("澳大利亚") || countryPart.includes("Australia")
        ? { zh: "澳大利亚", en: "Australia" }
        : { zh: countryPart, en: countryPart };

  const zh =
    place.zh && countryZh.zh
      ? `${place.zh}, ${countryZh.zh}`
      : place.zh ?? record.location;
  const en =
    place.en && countryZh.en
      ? `${place.en}, ${countryZh.en}`
      : place.en ?? record.location;

  return { zh, en };
}

export function getWeatherName(
  record: WeatherRecord,
  locale: AppLocale
): string {
  const parts = resolvedNameParts(record);
  if (locale === "zh") {
    return parts.zh ?? parts.en ?? record.name;
  }
  return parts.en ?? parts.zh ?? record.name;
}

export function getWeatherLocation(
  record: WeatherRecord,
  locale: AppLocale
): string | undefined {
  const parts = resolvedLocationParts(record);
  const country = countryName(record.countryCode, locale);
  const name = getWeatherName(record, locale);

  if (locale === "zh") {
    const loc = parts.zh ?? (country ? `${name}, ${country}` : undefined);
    return loc || undefined;
  }
  const loc = parts.en ?? (country ? `${name}, ${country}` : undefined);
  return loc || undefined;
}
