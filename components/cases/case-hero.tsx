"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SiteToolNav } from "@/components/site-tool-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import { AccountUserButton } from "@/components/account-user-button";
import { useI18n } from "@/components/locale-provider";
import type { AppLocale } from "@/lib/i18n";

export function CaseHero({
  locale,
  onLocaleChange,
}: {
  locale: AppLocale;
  onLocaleChange: (locale: AppLocale) => void;
}) {
  const { m } = useI18n();
  const cm = m.cases;

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_rgba(228,0,17,0.28),_transparent_55%),linear-gradient(180deg,#0b1220_0%,#111827_100%)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-5 pt-6 pb-14 sm:px-6 sm:pb-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-3">
            <Image
              src="/longi-logo.svg"
              alt="LONGi"
              width={86}
              height={40}
              priority
              className="h-8 w-auto shrink-0"
            />
            <div className="flex items-center gap-2 sm:hidden">
              <LanguageSwitcher locale={locale} onLocaleChange={onLocaleChange} />
              <AccountUserButton />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
            <SiteToolNav />
            <div className="hidden items-center gap-2 sm:flex">
              <LanguageSwitcher locale={locale} onLocaleChange={onLocaleChange} />
              <AccountUserButton />
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mt-14 max-w-3xl sm:mt-20"
        >
          <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-[#ff8080] uppercase">
            {cm.eyebrow}
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {cm.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {cm.subtitle}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
