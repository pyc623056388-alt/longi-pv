"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ScenarioDetail } from "@/components/products/scenario-detail";
import { LocaleProvider, useI18n } from "@/components/locale-provider";
import { getScenarioById } from "@/lib/product-scenario-catalog";
import type { AppLocale } from "@/lib/i18n";

const LOCALE_STORAGE_KEY = "longi-pv:locale";

function ScenarioNotFound() {
  const { m } = useI18n();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-5 text-center">
      <h1 className="text-2xl font-bold text-slate-900">
        {m.products.scenarioNotFound}
      </h1>
      <Link
        href="/products"
        className="text-sm font-semibold text-[#E40011] hover:underline"
      >
        {m.products.backToScenarios}
      </Link>
    </div>
  );
}

function ScenarioInner({
  locale,
  onLocaleChange,
}: {
  locale: AppLocale;
  onLocaleChange: (locale: AppLocale) => void;
}) {
  const params = useParams<{ scenario: string }>();
  const scenarioId =
    typeof params?.scenario === "string" ? params.scenario : "";
  const scenario = useMemo(
    () => (scenarioId ? getScenarioById(scenarioId) : undefined),
    [scenarioId]
  );

  if (!scenario || scenario.hidden) {
    return <ScenarioNotFound />;
  }

  return (
    <ScenarioDetail
      scenario={scenario}
      locale={locale}
      onLocaleChange={onLocaleChange}
    />
  );
}

export default function ScenarioRoutePage() {
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
      <ScenarioInner locale={locale} onLocaleChange={handleLocaleChange} />
    </LocaleProvider>
  );
}
