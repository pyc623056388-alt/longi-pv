"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CaseDetail } from "@/components/cases/case-detail";
import { LocaleProvider, useI18n } from "@/components/locale-provider";
import { getCaseStudyBySlug } from "@/lib/case-catalog";
import type { AppLocale } from "@/lib/i18n";

const LOCALE_STORAGE_KEY = "longi-pv:locale";

function CaseNotFound() {
  const { m } = useI18n();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-5 text-center">
      <h1 className="text-2xl font-bold text-slate-900">{m.cases.notFound}</h1>
      <Link
        href="/cases"
        className="text-sm font-semibold text-[#E40011] hover:underline"
      >
        {m.cases.backToList}
      </Link>
    </div>
  );
}

function CaseSlugInner({
  locale,
  onLocaleChange,
}: {
  locale: AppLocale;
  onLocaleChange: (locale: AppLocale) => void;
}) {
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const caseStudy = useMemo(
    () => (slug ? getCaseStudyBySlug(slug) : undefined),
    [slug]
  );

  if (!caseStudy) {
    return <CaseNotFound />;
  }

  return (
    <CaseDetail
      caseStudy={caseStudy}
      locale={locale}
      onLocaleChange={onLocaleChange}
    />
  );
}

export default function CaseSlugPage() {
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
      <CaseSlugInner locale={locale} onLocaleChange={handleLocaleChange} />
    </LocaleProvider>
  );
}
