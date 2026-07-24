"use client";

import { useI18n } from "@/components/locale-provider";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  caseDrivePreviewUrl,
  caseMediaThumbSrc,
  type CaseMedia,
} from "@/lib/case-catalog";

export function CaseMediaLightbox({
  media,
  open,
  onOpenChange,
}: {
  media: CaseMedia | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { locale, m } = useI18n();
  if (!media) return null;

  const label = locale === "zh" ? media.labelZh : media.labelEn;
  const thumb = caseMediaThumbSrc(media, 1600);
  const drivePreview = media.fileId
    ? caseDrivePreviewUrl(media.fileId)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl border-slate-800 bg-slate-950 p-3 text-white sm:p-4">
        <DialogTitle className="pr-8 text-sm font-semibold text-white">
          {label}
        </DialogTitle>
        <div className="mt-2 overflow-hidden rounded-lg bg-black">
          {drivePreview ? (
            <iframe
              title={label}
              src={drivePreview}
              className="aspect-video h-auto w-full min-h-[240px] border-0"
              allow="autoplay"
            />
          ) : media.type === "photo" && thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt={label}
              className="max-h-[70vh] w-full object-contain"
            />
          ) : (
            <div className="flex aspect-video items-center justify-center px-6 text-center text-sm text-slate-400">
              {media.type === "video"
                ? m.cases.media.videoPending
                : m.cases.media.photoPending}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
