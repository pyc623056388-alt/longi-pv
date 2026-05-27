import { getMessages } from "./index";
import type { AppLocale } from "./types";
import type { ModuleRecord } from "@/lib/pv-types";

const GENERIC_COMPETITOR_NAMES = new Set(["竞品", "Competitor"]);
const GENERIC_LONGI_NAMES = new Set(["隆基", "LONGi", "LONGi Solar"]);

/** 库内占位制造商 → 当前语言展示名 */
export function localizeManufacturer(name: string, locale: AppLocale): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;
  const m = getMessages(locale);
  if (GENERIC_COMPETITOR_NAMES.has(trimmed)) return m.common.competitor;
  if (GENERIC_LONGI_NAMES.has(trimmed)) return m.common.longi;
  return trimmed;
}

export function moduleDisplayName(
  record: ModuleRecord,
  locale: AppLocale
): string {
  return `${localizeManufacturer(record.manufacturer, locale)} ${record.model}`.trim();
}
