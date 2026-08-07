"use client";

import { CaseHero } from "@/components/cases/case-hero";
import { CaseList } from "@/components/cases/case-list";
import type { AppLocale } from "@/lib/i18n";

export function CasesPage({
  locale,
  onLocaleChange,
}: {
  locale: AppLocale;
  onLocaleChange: (locale: AppLocale) => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <CaseHero locale={locale} onLocaleChange={onLocaleChange} />
      <CaseList />
    </div>
  );
}
