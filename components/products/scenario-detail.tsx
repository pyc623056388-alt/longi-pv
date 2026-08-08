"use client";

import { ProductsSubHero } from "@/components/products/products-sub-hero";
import { ProductTile } from "@/components/products/product-tile";
import { useI18n } from "@/components/locale-provider";
import {
  scenarioGradeGroups,
  scenarioHasGrades,
  type ProductScenario,
} from "@/lib/product-scenario-catalog";
import type { AppLocale } from "@/lib/i18n";

export function ScenarioDetail({
  scenario,
  locale,
  onLocaleChange,
}: {
  scenario: ProductScenario;
  locale: AppLocale;
  onLocaleChange: (locale: AppLocale) => void;
}) {
  const { m } = useI18n();
  const pm = m.products;
  const name = locale === "zh" ? scenario.nameZh : scenario.nameEn;
  const tagline = locale === "zh" ? scenario.taglineZh : scenario.taglineEn;
  const groups = scenarioGradeGroups(scenario);
  const showGrades = scenarioHasGrades(scenario);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <ProductsSubHero
        locale={locale}
        onLocaleChange={onLocaleChange}
        backHref="/products"
        backLabel={pm.backToScenarios}
        eyebrow={pm.eyebrow}
        title={name}
        subtitle={tagline}
      />

      <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
        {groups.length === 0 ? (
          <p className="text-center text-slate-500">{pm.empty}</p>
        ) : showGrades ? (
          <div className="space-y-10">
            {groups.map((group) => (
              <div key={group.key}>
                <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
                  <span className="inline-block h-4 w-1 rounded-full bg-[#E40011]" />
                  {locale === "zh" ? group.labelZh : group.labelEn}
                  <span className="text-xs font-medium text-slate-400">
                    {pm.productCount(group.series.length)}
                  </span>
                </h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {group.series.map((series, i) => (
                    <ProductTile
                      key={series.id}
                      series={series}
                      scenarioId={scenario.id}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {groups[0].series.map((series, i) => (
              <ProductTile
                key={series.id}
                series={series}
                scenarioId={scenario.id}
                index={i}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
