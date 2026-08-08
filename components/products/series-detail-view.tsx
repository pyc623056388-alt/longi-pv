"use client";

import { ProductsSubHero } from "@/components/products/products-sub-hero";
import { ProductDetail } from "@/components/products/product-detail";
import { useI18n } from "@/components/locale-provider";
import type { ProductSeries } from "@/lib/product-matrix-catalog";
import type { ProductScenario } from "@/lib/product-scenario-catalog";
import type { AppLocale } from "@/lib/i18n";

export function SeriesDetailView({
  scenario,
  series,
  locale,
  onLocaleChange,
}: {
  scenario: ProductScenario;
  series: ProductSeries;
  locale: AppLocale;
  onLocaleChange: (locale: AppLocale) => void;
}) {
  const { m } = useI18n();
  const scenarioName = locale === "zh" ? scenario.nameZh : scenario.nameEn;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <ProductsSubHero
        locale={locale}
        onLocaleChange={onLocaleChange}
        backHref={`/products/${scenario.id}`}
        backLabel={m.products.backToScenario}
        eyebrow={scenarioName}
        title={series.modelFamily}
      />
      <section className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
        <ProductDetail series={series} />
      </section>
    </div>
  );
}
