"use client";

import { useCallback, useEffect, useState } from "react";
import { LocaleProvider } from "@/components/locale-provider";
import { StringCalculatorPage } from "@/components/string-calculator/string-calculator-page";
import type { AppLocale } from "@/lib/i18n";

const LOCALE_STORAGE_KEY = "longi-pv:locale";

export default function StringCalculatorRoutePage() {
  const [locale, setLocale] = useState<AppLocale>("zh");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored === "zh" || stored === "en") setLocale(stored);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const handleLocaleChange = useCallback((next: AppLocale) => {
    setLocale(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  if (!ready) {
    return <div className="min-h-screen bg-slate-950" />;
  }

  return (
    <LocaleProvider locale={locale}>
      <StringCalculatorPage locale={locale} onLocaleChange={handleLocaleChange} />
    </LocaleProvider>
  );
}
