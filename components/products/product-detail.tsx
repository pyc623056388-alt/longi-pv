"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Compass } from "lucide-react";
import { ProductResourcesPanel } from "@/components/recommend/product-resources-panel";
import {
  PhotoCarousel,
  photoViewLabel,
} from "@/components/products/photo-carousel";
import { useI18n } from "@/components/locale-provider";
import type { ProductSeries } from "@/lib/product-matrix-catalog";
import {
  buildSku,
  formatDatasheetPowerRange,
} from "@/lib/product-sku-catalog";
import { getProductPhotos } from "@/lib/product-drive-resources";
import { cn } from "@/lib/utils";

function recommendHref(seriesId: string): string {
  return `/recommend?series=${encodeURIComponent(seriesId)}`;
}

function compareHrefForModel(model: string): string {
  return `/?longiModel=${encodeURIComponent(model)}#module-compare`;
}

export function ProductDetail({ series }: { series: ProductSeries }) {
  const { m, locale } = useI18n();
  const rm = m.recommend;
  const pm = m.products;

  const sku = buildSku(series);
  const datasheetPowerRange = formatDatasheetPowerRange(series);
  const photos = getProductPhotos(series.id);
  const hasPhotos = photos.length > 0;
  const highlights = locale === "zh" ? series.highlightsZh : series.highlightsEn;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.05)]"
    >
      <div
        className={cn(
          "grid items-stretch gap-0",
          hasPhotos
            ? "lg:grid-cols-[minmax(240px,42%)_minmax(0,1fr)]"
            : "grid-cols-1"
        )}
      >
        {hasPhotos && (
          <PhotoCarousel
            photos={photos}
            labelFor={(label) => photoViewLabel(label, rm)}
          />
        )}

        <div className="flex min-h-0 flex-col">
          <div className="space-y-2.5 border-b border-slate-100 p-4 sm:p-5">
            <p className="text-xs font-semibold text-[#E40011]">
              {locale === "zh" ? series.nameZh : series.nameEn}
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {series.modelFamily}
            </h1>
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-800">{sku.model}</span>
              {" · "}
              {datasheetPowerRange}W
              <span className="hidden sm:inline">
                {" · "}
                {series.dimensionMm} mm
              </span>
            </p>

            <div className="inline-flex h-9 min-w-[8rem] items-center justify-center rounded-lg border border-[#E40011] bg-[#E40011]/10 px-3 text-xs font-semibold text-[#E40011]">
              {datasheetPowerRange}W
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
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 sm:p-5">
            <ProductResourcesPanel seriesId={series.id} compact />

            <div className="grid gap-2 sm:grid-cols-2">
              <Link
                href={recommendHref(series.id)}
                className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-[#E40011] text-sm font-bold text-white transition hover:bg-[#C4000F]"
              >
                <Compass className="h-4 w-4" />
                {pm.detail.openRecommend}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={compareHrefForModel(sku.model)}
                className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <BarChart3 className="h-4 w-4" />
                {pm.detail.openCompare}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
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
