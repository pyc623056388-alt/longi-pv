"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import {
  productPhotoSrc,
  type DriveResourceLink,
} from "@/lib/product-drive-resources";
import { cn } from "@/lib/utils";

/** 视角标签本地化：把 Drive 的 front/rear/side/bevel 映射到 i18n 文案 */
export function photoViewLabel(
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

export function PhotoCarousel({
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
    <div className="relative flex h-[min(32vh,220px)] flex-col bg-[#F1F5F9] sm:h-[min(36vh,260px)] lg:h-full lg:min-h-0">
      <div className="relative flex min-h-0 flex-1 items-center justify-center p-2 sm:p-3 lg:p-4">
        <a
          href={photo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-white/70 ring-1 ring-slate-200/80"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={photo.localSrc ?? photo.fileId}
            src={productPhotoSrc(photo, 1000)}
            alt={photo.label}
            className="max-h-full max-w-full object-contain p-2 transition group-hover:scale-[1.01] sm:p-3 lg:p-4"
          />
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/80 backdrop-blur-sm sm:bottom-2.5 sm:left-2.5 sm:text-[11px]">
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
              className="absolute top-1/2 left-1 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm transition hover:bg-white sm:left-2 sm:h-8 sm:w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => go(1)}
              className="absolute top-1/2 right-1 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm transition hover:bg-white sm:right-2 sm:h-8 sm:w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-1 px-2 pb-2 sm:gap-1.5 sm:pb-3">
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
