"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SiteToolNav } from "@/components/site-tool-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/components/locale-provider";
import type { AppLocale } from "@/lib/i18n";

export function RecommendHero({
  locale,
  onLocaleChange,
}: {
  locale: AppLocale;
  onLocaleChange: (locale: AppLocale) => void;
}) {
  const { m } = useI18n();
  const rm = m.recommend;

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top,_rgba(228,0,17,0.28),_transparent_55%),linear-gradient(180deg,#0b1220_0%,#111827_100%)]">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 pt-6 sm:px-6">
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
            <div className="sm:hidden">
              <LanguageSwitcher locale={locale} onLocaleChange={onLocaleChange} />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
            <SiteToolNav />
            <div className="hidden sm:block">
              <LanguageSwitcher locale={locale} onLocaleChange={onLocaleChange} />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-start justify-center py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-3xl"
          >
            <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-[#ff8080] uppercase">
              {rm.eyebrow}
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {rm.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {rm.subtitle}
            </p>
          </motion.div>
        </div>

        <motion.a
          href="#recommend-step1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mb-10 inline-flex flex-col items-center gap-2 self-center text-sm text-white/60 transition hover:text-white"
        >
          <span>{rm.scrollHint}</span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </motion.a>
      </div>
    </section>
  );
}
