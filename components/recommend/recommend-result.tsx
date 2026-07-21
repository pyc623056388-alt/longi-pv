"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ExternalLink } from "lucide-react";
import { ProductResourcesPanel } from "@/components/recommend/product-resources-panel";
import { useI18n } from "@/components/locale-provider";
import type { ProductRecommendMatch } from "@/lib/product-recommend-engine";
import {
  driveThumbnailUrl,
  getFrontRearPhotos,
} from "@/lib/product-drive-resources";
import { cn } from "@/lib/utils";

function compareHrefForModel(model: string): string {
  return `/?longiModel=${encodeURIComponent(model)}`;
}

interface RecommendResultProps {
  primary: ProductRecommendMatch;
  alternatives: ProductRecommendMatch[];
  selectedSeriesId: string;
  onSelectSeries: (seriesId: string) => void;
  onBack: () => void;
}

export function RecommendResult({
  primary,
  alternatives,
  selectedSeriesId,
  onSelectSeries,
  onBack,
}: RecommendResultProps) {
  const { m, locale } = useI18n();
  const rm = m.recommend;

  const current =
    [primary, ...alternatives].find((x) => x.series.id === selectedSeriesId) ??
    primary;
  const series = current.series;
  const photos = getFrontRearPhotos(series.id);
  const hasPhotos = photos.length > 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            {rm.backToFilters}
          </button>
          <div className="text-right">
            <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
              {rm.result.badge}
            </p>
            <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
              {rm.result.title}
            </h2>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={series.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]"
          >
            <div
              className={cn(
                "grid gap-0",
                hasPhotos
                  ? "lg:grid-cols-[minmax(240px,320px)_minmax(0,1fr)]"
                  : "grid-cols-1"
              )}
            >
              {hasPhotos && (
                <div className="space-y-3 bg-slate-950 p-4 sm:p-5">
                  {photos.map((photo) => {
                    const isFront = /front/i.test(photo.label);
                    return (
                      <a
                        key={photo.fileId}
                        href={photo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative block overflow-hidden rounded-2xl bg-slate-900"
                      >
                        <div className="relative aspect-[4/5] w-full">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={driveThumbnailUrl(photo.fileId, 900)}
                            alt={photo.label}
                            className="h-full w-full object-contain p-2 transition group-hover:scale-[1.02]"
                          />
                        </div>
                        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                          {isFront ? rm.photoFront : rm.photoRear}
                          <ExternalLink className="h-3 w-3 opacity-70" />
                        </span>
                      </a>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-col">
                <div className="space-y-4 border-b border-slate-100 p-5 sm:p-6">
                  <div>
                    <p className="text-sm font-medium text-[#E40011]">
                      {locale === "zh" ? series.nameZh : series.nameEn}
                    </p>
                    <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                      {series.representativeModel}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {series.powerMinWp}–{series.powerMaxWp} W ·{" "}
                      {series.dimensionMm} mm
                    </p>
                  </div>

                  <ul className="flex flex-wrap gap-2">
                    {(locale === "zh" ? series.highlightsZh : series.highlightsEn).map(
                      (h) => (
                        <li
                          key={h}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {h}
                        </li>
                      )
                    )}
                  </ul>

                  <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <SpecItem label={rm.result.efficiency} value={`${series.efficiencyMaxPct}%`} />
                    <SpecItem label={rm.result.weight} value={`${series.weightKg} kg`} />
                    <SpecItem label={rm.result.tempCoef} value={`${series.pmpTempCoef}%/°C`} />
                    <SpecItem
                      label={rm.result.degradation}
                      value={`${series.firstYearDegradationPct}% / ${series.annualDegradationPct}%`}
                    />
                    <SpecItem
                      label={rm.result.warranty}
                      value={`${series.productWarrantyYears}Y / ${series.performanceWarrantyYears}Y`}
                    />
                    <SpecItem
                      label={rm.result.glass}
                      value={
                        series.glass === "dual"
                          ? rm.result.dualGlass
                          : rm.result.singleGlass
                      }
                    />
                  </dl>

                  {(locale === "zh" ? current.reasonsZh : current.reasonsEn).length >
                    0 && (
                    <ul className="space-y-1">
                      {(locale === "zh" ? current.reasonsZh : current.reasonsEn).map(
                        (r) => (
                          <li
                            key={r}
                            className="flex items-start gap-2 text-sm text-slate-600"
                          >
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                            <span>{r}</span>
                          </li>
                        )
                      )}
                    </ul>
                  )}

                  <Link
                    href={compareHrefForModel(series.representativeModel)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#E40011] px-5 text-sm font-semibold text-white transition hover:bg-[#C4000F]"
                  >
                    {rm.result.openCompare}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="p-5 sm:p-6">
                  <ProductResourcesPanel seriesId={series.id} />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {alternatives.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-slate-900">
              {rm.weakAlternatives}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{rm.weakAlternativesHint}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {alternatives.map((item) => {
                const active = item.series.id === selectedSeriesId;
                return (
                  <button
                    key={item.series.id}
                    type="button"
                    onClick={() => onSelectSeries(item.series.id)}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition",
                      active
                        ? "border-[#E40011] bg-[#E40011]/[0.04] shadow-md ring-1 ring-[#E40011]/30"
                        : "border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:shadow-md"
                    )}
                  >
                    <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                      {rm.result.alternative}
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {item.series.representativeModel}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.series.powerMinWp}–{item.series.powerMaxWp} W ·{" "}
                      {locale === "zh" ? item.series.nameZh : item.series.nameEn}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <dt className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">
        {value}
      </dd>
    </div>
  );
}
