"use client";

import { useCallback, useEffect, useState } from "react";
import { ProductsPage } from "@/components/products/products-page";
import { LocaleProvider } from "@/components/locale-provider";
import type { AppLocale } from "@/lib/i18n";

const LOCALE_STORAGE_KEY = "longi-pv:locale";

export default function ProductsRoutePage() {
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
      <ProductsPage locale={locale} onLocaleChange={handleLocaleChange} />
    </LocaleProvider>
  );
}
