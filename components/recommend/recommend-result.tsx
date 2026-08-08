"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ProductResourcesPanel } from "@/components/recommend/product-resources-panel";
import {
  PhotoCarousel,
  photoViewLabel,
} from "@/components/products/photo-carousel";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useI18n } from "@/components/locale-provider";
import type { ProductRecommendMatch } from "@/lib/product-recommend-engine";
import {
  formatDatasheetPowerRange,
  listDriveProductModels,
  skuFromSeriesId,
} from "@/lib/product-sku-catalog";
import { getProductPhotos } from "@/lib/product-drive-resources";
import { cn } from "@/lib/utils";

function compareHrefForModel(model: string): string {
  return `/?longiModel=${encodeURIComponent(model)}#module-compare`;
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

  const rankedMatches = useMemo(
    () => [primary, ...alternatives],
    [primary, alternatives]
  );
  const matchedIds = useMemo(
    () => new Set(rankedMatches.map((x) => x.series.id)),
    [rankedMatches]
  );

  const sku =
    skuFromSeriesId(selectedSeriesId) ?? skuFromSeriesId(primary.series.id)!;
  const series = sku.series;
  const currentMatch = rankedMatches.find((x) => x.series.id === series.id);
  const isManualBrowse = !matchedIds.has(series.id);
  const datasheetPowerRange = formatDatasheetPowerRange(series);

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

  const segmentShort = useMemo(
    () =>
      ({
        residential: locale === "zh" ? "户用" : "Res",
        medium: locale === "zh" ? "中版" : "Mid",
        large: locale === "zh" ? "大版" : "Large",
      }) as const,
    [locale]
  );

  const modelOptions = useMemo(
    () =>
      listDriveProductModels().map((s) => ({
        value: s.id,
        /** 列表用短标签，避免手机截断 */
        label: `${s.modelFamily} · ${segmentShort[s.segment]}`,
        keywords: [
          s.id,
          s.modelFamily,
          s.representativeModel,
          s.nameZh,
          s.nameEn,
          String(s.powerMinWp),
          String(s.powerMaxWp),
        ].join(" "),
      })),
    [segmentShort]
  );

  const handleSeriesChange = (seriesId: string) => {
    onSelectSeries(seriesId);
  };

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
            key={`${series.id}-${sku.powerWp}`}
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
                <div className="shrink-0 space-y-2 border-b border-slate-100 p-3 sm:space-y-2.5 sm:p-4">
                  {/* 桌面：系列名 + 对比；手机：仅短状态，对比下移 */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <p className="hidden text-xs font-medium text-[#E40011] sm:block">
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
                    <Link
                      href={compareHrefForModel(sku.model)}
                      className="hidden h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#E40011] px-3 text-xs font-semibold text-white transition hover:bg-[#C4000F] lg:inline-flex"
                    >
                      {rm.result.openCompare}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* 型号 / 功率：手机两行拉满，桌面并排 */}
                  <div className="space-y-2">
                    <div className="min-w-0 space-y-1">
                      <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                        {rm.result.pickSeries}
                      </p>
                      <SearchableSelect
                        value={series.id}
                        onValueChange={handleSeriesChange}
                        options={modelOptions}
                        triggerLabel={series.modelFamily}
                        placeholder={rm.result.pickSeries}
                        searchPlaceholder={rm.result.pickSeriesSearch}
                        emptyText={rm.result.pickSeriesEmpty}
                        triggerClassName={cn(
                          "h-11 w-full justify-between rounded-xl border-slate-200 bg-white px-3 py-2 text-left shadow-none sm:h-auto sm:min-h-10",
                          "hover:border-slate-300 hover:bg-slate-50",
                          "[&_span]:truncate [&_span]:text-lg [&_span]:font-extrabold [&_span]:tracking-tight [&_span]:text-slate-900 sm:[&_span]:text-xl"
                        )}
                      />
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                        {rm.result.powerRange}
                      </p>
                      <div className="inline-flex h-9 min-w-[7.5rem] items-center justify-center rounded-lg border border-[#E40011] bg-[#E40011]/10 px-3 text-xs font-semibold text-[#E40011] sm:min-w-[8.5rem]">
                        {datasheetPowerRange}W
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">
                      {sku.model}
                    </span>
                    {" · "}
                    {datasheetPowerRange}W
                    <span className="hidden sm:inline">
                      {" · "}
                      {series.dimensionMm} mm
                    </span>
                  </p>

                  {highlights.length > 0 && (
                    <ul className="hidden flex-wrap gap-1.5 sm:flex">
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
                    <ul className="hidden flex-wrap gap-x-3 gap-y-1 sm:flex">
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

                <div className="flex min-h-0 flex-1 flex-col gap-2.5 p-3 sm:p-3.5">
                  <ProductResourcesPanel seriesId={series.id} compact />
                  <Link
                    href={compareHrefForModel(sku.model)}
                    className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
                  >
                    {rm.result.openCompare}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
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
                onClick={() => handleSeriesChange(item.series.id)}
                className="inline-flex h-7 items-center rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                {item.series.modelFamily}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.section>
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
