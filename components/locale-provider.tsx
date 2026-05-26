"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import {
  formatDateTime,
  formatNumber,
  getMessages,
  type AppLocale,
  type Messages,
} from "@/lib/i18n";

interface LocaleContextValue {
  locale: AppLocale;
  m: Messages;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDateTime: (date: Date) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: AppLocale;
  children: ReactNode;
}) {
  const value = useMemo<LocaleContextValue>(() => {
    const m = getMessages(locale);
    return {
      locale,
      m,
      formatNumber: (v, options) => formatNumber(locale, v, options),
      formatDateTime: (d) => formatDateTime(locale, d),
    };
  }, [locale]);

  useEffect(() => {
    document.documentElement.lang = value.m.htmlLang;
  }, [value.m.htmlLang]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useI18n(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useI18n must be used within LocaleProvider");
  }
  return ctx;
}
