"use client";

import type { ReactNode } from "react";
import {
  ExternalLink,
  FileText,
  ScrollText,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useI18n } from "@/components/locale-provider";
import {
  getProductDriveResources,
  type DriveResourceLink,
} from "@/lib/product-drive-resources";
import { cn } from "@/lib/utils";

function ResourceAnchor({
  href,
  children,
  className,
  title,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <a
      href={href}
      title={title}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex h-8 max-w-full items-center gap-1 truncate rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-700 transition",
        "hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
        className
      )}
    >
      {children}
      <ExternalLink className="h-3 w-3 shrink-0 opacity-45" />
    </a>
  );
}

function shortCertLabel(link: DriveResourceLink): string {
  if (link.category) return link.category;
  const beforeDot = link.label.split(" · ")[0]?.trim();
  return beforeDot || link.label;
}

interface ProductResourcesPanelProps {
  seriesId: string;
  /** 结果页紧凑布局：单屏网格、隐藏照片区 */
  compact?: boolean;
}

export function ProductResourcesPanel({
  seriesId,
  compact = false,
}: ProductResourcesPanelProps) {
  const { m } = useI18n();
  const resources = getProductDriveResources(seriesId);
  const rm = m.recommend.resources;

  if (!resources) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
        {rm.unavailable}
      </div>
    );
  }

  const primary: {
    key: string;
    link?: DriveResourceLink;
    icon: ReactNode;
    title: string;
  }[] = [
    {
      key: "datasheet",
      link: resources.datasheet,
      icon: <FileText className="h-3 w-3 shrink-0" />,
      title: rm.datasheet,
    },
    {
      key: "warranty",
      link: resources.warranty,
      icon: <ShieldCheck className="h-3 w-3 shrink-0" />,
      title: rm.warranty,
    },
    {
      key: "im",
      link: resources.installationManual,
      icon: <Wrench className="h-3 w-3 shrink-0" />,
      title: rm.installationManual,
    },
  ];

  const certificates = resources.certificates.filter(
    (c) =>
      c.category !== "Anti-Glare" && !/anti[\s-]?glare/i.test(c.label)
  );

  if (compact) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 sm:p-3">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <p className="text-xs font-semibold text-slate-900">{rm.title}</p>
          <p className="hidden text-[10px] text-slate-400 sm:block">
            {rm.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
          {primary.map((item) =>
            item.link ? (
              <ResourceAnchor
                key={item.key}
                href={item.link.url}
                className="font-semibold text-slate-900"
              >
                {item.icon}
                <span className="truncate">{item.title}</span>
              </ResourceAnchor>
            ) : null
          )}
          {certificates.map((link) => (
            <ResourceAnchor
              key={link.fileId + link.label}
              href={link.url}
              title={link.label}
            >
              <ScrollText className="h-3 w-3 shrink-0 text-[#E40011]/70" />
              <span className="truncate">{shortCertLabel(link)}</span>
            </ResourceAnchor>
          ))}
        </div>

        {certificates.length === 0 &&
          primary.every((p) => !p.link) && (
            <p className="mt-1 text-[11px] text-slate-400">{rm.certsEmpty}</p>
          )}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">{rm.title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{rm.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {primary.map((item) =>
          item.link ? (
            <ResourceAnchor
              key={item.key}
              href={item.link.url}
              className="border-slate-900/10 bg-white font-semibold text-slate-900"
            >
              {item.icon}
              {item.title}
            </ResourceAnchor>
          ) : null
        )}
      </div>

      <div>
        <div className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
          <ScrollText className="h-3.5 w-3.5 text-[#E40011]" />
          {rm.certificates}
        </div>
        {certificates.length ? (
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
            {certificates.map((link) => (
              <ResourceAnchor
                key={link.fileId + link.label}
                href={link.url}
                title={link.label}
              >
                <span className="truncate">{shortCertLabel(link)}</span>
              </ResourceAnchor>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">{rm.certsEmpty}</p>
        )}
      </div>
    </div>
  );
}
