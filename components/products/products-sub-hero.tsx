"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteToolHeader } from "@/components/site-tool-header";
import { LanguageSwitcher } from "@/components/language-switcher";
import { AccountUserButton } from "@/components/account-user-button";
import type { AppLocale } from "@/lib/i18n";

/** 二/三级页面的深色头部：站点导航 + 返回 + 标题。 */
export function ProductsSubHero({
  locale,
  onLocaleChange,
  backHref,
  backLabel,
  eyebrow,
  title,
  subtitle,
}: {
  locale: AppLocale;
  onLocaleChange: (locale: AppLocale) => void;
  backHref: string;
  backLabel: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_rgba(228,0,17,0.24),_transparent_55%),linear-gradient(180deg,#0b1220_0%,#111827_100%)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-5 pt-6 pb-10 sm:px-6 sm:pb-12">
        <SiteToolHeader
          utilities={
            <>
              <LanguageSwitcher locale={locale} onLocaleChange={onLocaleChange} />
              <AccountUserButton />
            </>
          }
        />

        <div className="mt-8 sm:mt-10">
          <Link
            href={backHref}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-3 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backLabel}
          </Link>

          {eyebrow ? (
            <p className="mt-5 text-xs font-semibold tracking-[0.18em] text-[#ff8080] uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
