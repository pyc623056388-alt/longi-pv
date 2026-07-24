"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MapPin, Play } from "lucide-react";
import { motion } from "framer-motion";
import { CaseMediaLightbox } from "@/components/cases/case-media-lightbox";
import { SiteToolHeader } from "@/components/site-tool-header";
import { LanguageSwitcher } from "@/components/language-switcher";
import { AccountUserButton } from "@/components/account-user-button";
import { useI18n } from "@/components/locale-provider";
import {
  caseCoverSrc,
  caseLinkedSeries,
  caseMediaThumbSrc,
  recommendHrefForSeries,
  type CaseMedia,
  type CaseStudy,
} from "@/lib/case-catalog";
import type { AppLocale } from "@/lib/i18n";

export function CaseDetail({
  caseStudy,
  locale,
  onLocaleChange,
}: {
  caseStudy: CaseStudy;
  locale: AppLocale;
  onLocaleChange: (locale: AppLocale) => void;
}) {
  const { m } = useI18n();
  const cm = m.cases;
  const [activeMedia, setActiveMedia] = useState<CaseMedia | null>(null);

  const title = locale === "zh" ? caseStudy.titleZh : caseStudy.titleEn;
  const location =
    locale === "zh" ? caseStudy.locationZh : caseStudy.locationEn;
  const summary =
    locale === "zh" ? caseStudy.summaryZh : caseStudy.summaryEn;
  const body = locale === "zh" ? caseStudy.bodyZh : caseStudy.bodyEn;
  const cover = caseCoverSrc(caseStudy);
  const seriesList = caseLinkedSeries(caseStudy);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_rgba(228,0,17,0.22),_transparent_55%),linear-gradient(180deg,#0b1220_0%,#111827_100%)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col px-5 pt-6 sm:px-6">
          <SiteToolHeader
            utilities={
              <>
                <LanguageSwitcher
                  locale={locale}
                  onLocaleChange={onLocaleChange}
                />
                <AccountUserButton />
              </>
            }
          />

          <div className="mt-8 mb-6">
            <Link
              href="/cases"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/75 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              {cm.backToList}
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-5 pb-10 sm:px-6">
          <div className="relative aspect-[21/9] min-h-[200px] overflow-hidden rounded-2xl bg-slate-800 ring-1 ring-white/10">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt={title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                {cm.media.coverPending}
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="max-w-3xl"
        >
          <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-500">
            <MapPin className="h-4 w-4" />
            {location}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            {summary}
          </p>
          <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-slate-700">
            {body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </motion.div>

        <section className="mt-12">
          <h2 className="mb-4 text-lg font-bold text-slate-900">
            {cm.galleryTitle}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {caseStudy.media.map((media) => {
              const label =
                locale === "zh" ? media.labelZh : media.labelEn;
              const thumb = caseMediaThumbSrc(media);
              return (
                <button
                  key={`${media.type}-${label}`}
                  type="button"
                  onClick={() => setActiveMedia(media)}
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-200 text-left ring-1 ring-slate-200 transition hover:ring-slate-300"
                >
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt={label}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 bg-slate-800 px-4 text-center text-sm text-slate-300">
                      {media.type === "video" ? (
                        <Play className="h-8 w-8 text-white/80" />
                      ) : null}
                      <span>
                        {media.type === "video"
                          ? cm.media.videoPending
                          : cm.media.photoPending}
                      </span>
                    </div>
                  )}
                  {media.type === "video" && thumb ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-slate-900">
                        <Play className="h-5 w-5 translate-x-0.5" />
                      </span>
                    </span>
                  ) : null}
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-xs font-semibold text-white">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-slate-500">{cm.galleryHint}</p>
        </section>

        <section className="mt-14 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900">
            {cm.relatedSeriesTitle}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {cm.relatedSeriesHint}
          </p>
          <ul className="mt-5 space-y-3">
            {seriesList.map((series) => {
              const name =
                locale === "zh" ? series.nameZh : series.nameEn;
              return (
                <li
                  key={series.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {series.modelFamily}
                    </p>
                    <p className="text-sm text-slate-600">{name}</p>
                  </div>
                  <Link
                    href={recommendHrefForSeries(series.id)}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#E40011] px-4 text-sm font-semibold text-white transition hover:bg-[#c4000f]"
                  >
                    {cm.viewSeries}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      <CaseMediaLightbox
        media={activeMedia}
        open={Boolean(activeMedia)}
        onOpenChange={(open) => {
          if (!open) setActiveMedia(null);
        }}
      />
    </div>
  );
}
