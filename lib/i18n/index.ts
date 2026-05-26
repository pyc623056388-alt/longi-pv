import { enMessages } from "./messages/en";
import { zhMessages, type Messages } from "./messages/zh";
import type { AppLocale } from "./types";

export type { AppLocale, ResultMetricId, ModuleSpecFieldKey } from "./types";
export type { Messages } from "./messages/zh";
export { metricHigherIsBetterById, metricHigherIsBetter } from "./metrics";

const catalogs: Record<AppLocale, Messages> = {
  zh: zhMessages,
  en: enMessages,
};

export function getMessages(locale: AppLocale): Messages {
  return catalogs[locale] ?? zhMessages;
}

export function formatNumber(
  locale: AppLocale,
  value: number,
  options?: Intl.NumberFormatOptions
): string {
  return value.toLocaleString(getMessages(locale).numberLocale, options);
}

export function formatDateTime(locale: AppLocale, date: Date): string {
  return date.toLocaleString(getMessages(locale).numberLocale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
