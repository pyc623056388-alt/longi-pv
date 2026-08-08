"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SeriesDetailView } from "@/components/products/series-detail-view";
import { LocaleProvider, useI18n } from "@/components/locale-provider";
import { getProductSeriesById } from "@/lib/product-matrix-catalog";
import {
  getScenarioById,
  scenarioIncludesSeries,
} from "@/lib/product-scenario-catalog";
import type { AppLocale } from "@/lib/i18n";

const LOCALE_STORAGE_KEY = "longi-pv:locale";

function ProductNotFound({ scenarioId }: { scenarioId: string }) {
  const { m } = useI18n();
  const scenario = getScenarioById(scenarioId);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-5 text-center">
      <h1 className="text-2xl font-bold text-slate-900">
        {m.products.notFound}
      </h1>
      <Link
        href={scenario && !scenario.hidden ? `/products/${scenarioId}` : "/products"}
        className="text-sm font-semibold text-[#E40011] hover:underline"
      >
        {scenario && !scenario.hidden
          ? m.products.backToScenario
          : m.products.backToScenarios}
      </Link>
    </div>
  );
}

function SeriesInner({
  locale,
  onLocaleChange,
}: {
  locale: AppLocale;
  onLocaleChange: (locale: AppLocale) => void;
}) {
  const params = useParams<{ scenario: string; series: string }>();
  const scenarioId =
    typeof params?.scenario === "string" ? params.scenario : "";
  const seriesId = typeof params?.series === "string" ? params.series : "";

  const scenario = useMemo(
    () => (scenarioId ? getScenarioById(scenarioId) : undefined),
    [scenarioId]
  );
  const series = useMemo(
    () => (seriesId ? getProductSeriesById(seriesId) : undefined),
    [seriesId]
  );

  if (
    !scenario ||
    scenario.hidden ||
    !series ||
    !scenarioIncludesSeries(scenario, series.id)
  ) {
    return <ProductNotFound scenarioId={scenarioId} />;
  }

  return (
    <SeriesDetailView
      scenario={scenario}
      series={series}
      locale={locale}
      onLocaleChange={onLocaleChange}
    />
  );
}

export default function SeriesRoutePage() {
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
      <SeriesInner locale={locale} onLocaleChange={handleLocaleChange} />
    </LocaleProvider>
  );
}
