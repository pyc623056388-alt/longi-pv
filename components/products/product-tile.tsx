"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/components/locale-provider";
import type { ProductSeries } from "@/lib/product-matrix-catalog";
import {
  driveThumbnailUrl,
  getProductPhotos,
} from "@/lib/product-drive-resources";
import { formatDatasheetPowerRange } from "@/lib/product-sku-catalog";

/** 取产品索引图：优先 Drive 正面照 → 系列内置图 → 无 */
function productTileImage(series: ProductSeries): string | null {
  const photo = getProductPhotos(series.id)[0];
  if (photo) return driveThumbnailUrl(photo.fileId, 800);
  return series.imageSrc ?? null;
}

export function ProductTile({
  series,
  scenarioId,
  index = 0,
}: {
  series: ProductSeries;
  scenarioId: string;
  index?: number;
}) {
  const { locale } = useI18n();
  const img = productTileImage(series);
  const name = locale === "zh" ? series.nameZh : series.nameEn;
  const powerRange = formatDatasheetPowerRange(series);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, delay: (index % 8) * 0.04 }}
    >
      <Link
        href={`/products/${scenarioId}/${series.id}`}
        className="group block overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#F1F5F9]">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={series.modelFamily}
              className="max-h-full max-w-full object-contain p-4 transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <span className="text-lg font-bold text-slate-400">
              {series.modelFamily}
            </span>
          )}
        </div>
        <div className="border-t border-slate-100 p-3">
          <p className="truncate text-sm font-bold text-slate-900">
            {series.modelFamily}
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-500">{name}</p>
          <p className="mt-1 text-[11px] font-semibold text-[#E40011]">
            {powerRange}W
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
