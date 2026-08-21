"use client";

import { motion } from "framer-motion";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { SiteToolHeader } from "@/components/site-tool-header";
import { LanguageSwitcher } from "@/components/language-switcher";
import { AccountUserButton } from "@/components/account-user-button";
import { useI18n } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import type { AppLocale } from "@/lib/i18n";

export function StringCalculatorHero({
  locale,
  onLocaleChange,
  exporting,
  onExportExcel,
  onExportWord,
}: {
  locale: AppLocale;
  onLocaleChange: (locale: AppLocale) => void;
  exporting: "xlsx" | "docx" | null;
  onExportExcel: () => void;
  onExportWord: () => void;
}) {
  const { m } = useI18n();
  const t = m.stringCalc;

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_rgba(228,0,17,0.28),_transparent_55%),linear-gradient(180deg,#0b1220_0%,#111827_100%)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-5 pt-6 pb-14 sm:px-6 sm:pb-16">
        <SiteToolHeader
          utilities={
            <>
              <LanguageSwitcher locale={locale} onLocaleChange={onLocaleChange} />
              <AccountUserButton />
            </>
          }
        />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mt-12 flex flex-col gap-6 sm:mt-16 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-[#ff8080] uppercase">
              {t.eyebrow}
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {t.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {t.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={onExportExcel}
              disabled={exporting != null}
              className="rounded-xl bg-white text-slate-900 hover:bg-white/90"
            >
              {exporting === "xlsx" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
              {exporting === "xlsx" ? t.exporting : t.exportExcel}
            </Button>
            <Button
              type="button"
              onClick={onExportWord}
              disabled={exporting != null}
              className="rounded-xl bg-[#E40011] text-white hover:bg-[#c4000f]"
            >
              {exporting === "docx" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {exporting === "docx" ? t.exporting : t.exportWord}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
