"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { ProductResourcesPanel } from "@/components/recommend/product-resources-panel";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useI18n } from "@/components/locale-provider";
import type { ProductRecommendMatch } from "@/lib/product-recommend-engine";
import {
  defaultSkuForSeries,
  getProductSkuByModel,
  listDriveProductSkus,
} from "@/lib/product-sku-catalog";
import {
  driveThumbnailUrl,
  getProductPhotos,
  type DriveResourceLink,
} from "@/lib/product-drive-resources";
import { cn } from "@/lib/utils";

function compareHrefForModel(model: string): string {
  return `/?longiModel=${encodeURIComponent(model)}`;
}

function photoViewLabel(
  label: string,
  rm: {
    photoFront: string;
    photoRear: string;
    photoSide: string;
    photoBevel: string;
    photoOther: string;
  }
): string {
  const l = label.toLowerCase();
  if (l.includes("front")) return rm.photoFront;
  if (l.includes("rear")) return rm.photoRear;
  if (l.includes("side")) return rm.photoSide;
  if (l.includes("bevel")) return rm.photoBevel;
  return rm.photoOther;
}

interface RecommendResultProps {
  primary: ProductRecommendMatch;
  alternatives: ProductRecommendMatch[];
  selectedModel: string;
  onSelectModel: (model: string) => void;
  onBack: () => void;
}

export function RecommendResult({
  primary,
  alternatives,
  selectedModel,
  onSelectModel,
  onBack,
}: RecommendResultProps) {
  const { m, locale } = useI18n();
  const rm = m.recommend;

  const rankedMatches = useMemo(
    () => [primary, ...alternatives],
    [primary, alternatives]
  );
  const matchedIds = useMemo(
    () => new Set(rankedMatches.map((x) => x.series.id)),
    [rankedMatches]
  );

  const sku =
    getProductSkuByModel(selectedModel) ??
    defaultSkuForSeries(primary.series.id)!;
  const series = sku.series;
  const currentMatch = rankedMatches.find((x) => x.series.id === series.id);
  const isManualBrowse = !matchedIds.has(series.id);

  const photos = getProductPhotos(series.id);
  const hasPhotos = photos.length > 0;
  const switchOptions = rankedMatches.filter(
    (item) => item.series.id !== series.id
  );
  const reasons = currentMatch
    ? locale === "zh"
      ? currentMatch.reasonsZh
      : currentMatch.reasonsEn
    : [];
  const highlights =
    locale === "zh" ? series.highlightsZh : series.highlightsEn;

  const skuOptions = useMemo(
    () =>
      listDriveProductSkus().map((s) => ({
        value: s.model,
        label: `${s.model} · ${
          locale === "zh" ? s.series.nameZh : s.series.nameEn
        }`,
        keywords: [
          s.model,
          s.seriesId,
          s.series.modelFamily,
          s.series.nameZh,
          s.series.nameEn,
          String(s.powerWp),
        ].join(" "),
      })),
    [locale]
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-slate-50 to-white py-4 sm:py-5"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 sm:px-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {rm.backToFilters}
          </button>
          <div className="text-right">
            <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
              {rm.result.badge}
            </p>
            <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
              {rm.result.title}
            </h2>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={sku.model}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.05)]"
          >
            <div
              className={cn(
                "grid min-h-0 flex-1 items-stretch gap-0",
                hasPhotos
                  ? "lg:grid-cols-[minmax(220px,38%)_minmax(0,1fr)]"
                  : "grid-cols-1"
              )}
            >
              {hasPhotos && (
                <PhotoCarousel
                  photos={photos}
                  labelFor={(label) => photoViewLabel(label, rm)}
                />
              )}

              <div className="flex min-h-0 flex-col lg:h-full">
                <div className="shrink-0 space-y-2.5 border-b border-slate-100 p-3.5 sm:p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <p className="text-xs font-medium text-[#E40011]">
                          {locale === "zh" ? series.nameZh : series.nameEn}
                        </p>
                        <span
                          className={cn(
                            "rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                            isManualBrowse
                              ? "bg-slate-100 text-slate-600"
                              : "bg-emerald-50 text-emerald-700"
                          )}
                        >
                          {isManualBrowse
                            ? rm.result.manualBrowse
                            : rm.result.recommendedMatch}
                        </span>
                      </div>
                      <SearchableSelect
                        value={sku.model}
                        onValueChange={onSelectModel}
                        options={skuOptions}
                        placeholder={rm.result.pickSeries}
                        searchPlaceholder={rm.result.pickSeriesSearch}
                        emptyText={rm.result.pickSeriesEmpty}
                        triggerClassName={cn(
                          "h-auto min-h-10 w-full max-w-xl justify-between rounded-xl border-slate-200 bg-white px-3 py-2 text-left shadow-none",
                          "hover:border-slate-300 hover:bg-slate-50",
                          "[&_span]:line-clamp-2 [&_span]:text-base [&_span]:font-extrabold [&_span]:tracking-tight [&_span]:text-slate-900 sm:[&_span]:text-xl"
                        )}
                      />
                      <p className="mt-1.5 text-xs text-slate-500">
                        {sku.powerWp} W · {series.powerMinWp}–{series.powerMaxWp}{" "}
                        W · {series.dimensionMm} mm
                      </p>
                    </div>
                    <Link
                      href={compareHrefForModel(sku.model)}
                      className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#E40011] px-3 text-xs font-semibold text-white transition hover:bg-[#C4000F]"
                    >
                      {rm.result.openCompare}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {highlights.length > 0 && (
                    <ul className="flex flex-wrap gap-1.5">
                      {highlights.slice(0, 4).map((h) => (
                        <li
                          key={h}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                        >
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}

                  <dl className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                    <SpecItem
                      label={rm.result.efficiency}
                      value={`${series.efficiencyMaxPct}%`}
                    />
                    <SpecItem
                      label={rm.result.weight}
                      value={`${series.weightKg} kg`}
                    />
                    <SpecItem
                      label={rm.result.tempCoef}
                      value={`${series.pmpTempCoef}%/°C`}
                    />
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

                  {!isManualBrowse && reasons.length > 0 && (
                    <ul className="flex flex-wrap gap-x-3 gap-y-1">
                      {reasons.slice(0, 4).map((r) => (
                        <li
                          key={r}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-600"
                        >
                          <Check className="h-3 w-3 shrink-0 text-emerald-600" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-3.5">
                  <ProductResourcesPanel seriesId={series.id} compact />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {switchOptions.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500">
              {rm.weakAlternatives}:
            </span>
            {switchOptions.map((item) => (
              <button
                key={item.series.id}
                type="button"
                onClick={() =>
                  onSelectModel(item.series.representativeModel)
                }
                className="inline-flex h-7 items-center rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                {item.series.representativeModel}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}

function PhotoCarousel({
  photos,
  labelFor,
}: {
  photos: DriveResourceLink[];
  labelFor: (label: string) => string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [photos]);

  const safeIndex = Math.min(index, Math.max(photos.length - 1, 0));
  const photo = photos[safeIndex];
  if (!photo) return null;

  const label = labelFor(photo.label);
  const canPrev = photos.length > 1;
  const go = (dir: -1 | 1) => {
    setIndex((i) => (i + dir + photos.length) % photos.length);
  };

  return (
    <div className="relative flex h-full min-h-[220px] flex-col bg-[#F1F5F9] lg:min-h-0">
      <div className="relative flex min-h-0 flex-1 items-center justify-center p-3 sm:p-4">
        <a
          href={photo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-white/70 ring-1 ring-slate-200/80"
        >
          <img
            key={photo.fileId}
            src={driveThumbnailUrl(photo.fileId, 1000)}
            alt={photo.label}
            className="max-h-full max-w-full object-contain p-3 transition group-hover:scale-[1.01] sm:p-4"
          />
          <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/80 backdrop-blur-sm">
            {label}
            <ExternalLink className="h-3 w-3 opacity-60" />
          </span>
        </a>

        {canPrev && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => go(-1)}
              className="absolute top-1/2 left-1.5 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm transition hover:bg-white sm:left-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => go(1)}
              className="absolute top-1/2 right-1.5 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm transition hover:bg-white sm:right-2"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 px-2 pb-3">
          {photos.map((p, i) => {
            const tip = labelFor(p.label);
            return (
              <button
                key={p.fileId}
                type="button"
                aria-label={tip}
                onClick={() => setIndex(i)}
                className={cn(
                  "rounded-md px-2 py-0.5 text-[10px] font-semibold transition",
                  i === safeIndex
                    ? "bg-white text-slate-900 ring-1 ring-slate-300"
                    : "text-slate-500 hover:bg-white/70 hover:text-slate-700"
                )}
              >
                {tip}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2 py-1.5">
      <dt className="truncate text-[9px] font-medium tracking-wide text-slate-400 uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-xs font-semibold tabular-nums text-slate-900">
        {value}
      </dd>
    </div>
  );
}
