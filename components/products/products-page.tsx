"use client";

import { ProductsHero } from "@/components/products/products-hero";
import { ScenarioGrid } from "@/components/products/scenario-grid";
import type { AppLocale } from "@/lib/i18n";

export function ProductsPage({
  locale,
  onLocaleChange,
}: {
  locale: AppLocale;
  onLocaleChange: (locale: AppLocale) => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <ProductsHero locale={locale} onLocaleChange={onLocaleChange} />
      <ScenarioGrid />
    </div>
  );
}
