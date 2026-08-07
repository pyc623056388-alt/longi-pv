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
        "inline-flex h-9 w-full items-center gap-1.5 truncate rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-700 transition",
        "hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
        className
      )}
    >
      {children}
      <ExternalLink className="h-3 w-3 shrink-0 opacity-45" />
    </a>
  );
}

function SectionLabel({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
      <span className="text-[#E40011]">{icon}</span>
      {children}
    </div>
  );
}

function shortCertLabel(link: DriveResourceLink): string {
  if (link.category) return link.category;
  const beforeDot = link.label.split(" · ")[0]?.trim();
  return beforeDot || link.label;
}

interface ProductResourcesPanelProps {
  seriesId: string;
  /** 结果页：Core Docs + Certificates 分区，证书区拉伸填底 */
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
      <div className="flex h-full items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
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
      icon: <FileText className="h-3.5 w-3.5 shrink-0" />,
      title: rm.datasheet,
    },
    {
      key: "warranty",
      link: resources.warranty,
      icon: <ShieldCheck className="h-3.5 w-3.5 shrink-0" />,
      title: rm.warranty,
    },
    {
      key: "im",
      link: resources.installationManual,
      icon: <Wrench className="h-3.5 w-3.5 shrink-0" />,
      title: rm.installationManual,
    },
  ];

  const certificates = resources.certificates.filter(
    (c) =>
      c.category !== "Anti-Glare" && !/anti[\s-]?glare/i.test(c.label)
  );

  if (compact) {
    return (
      <div className="flex h-full min-h-0 flex-col rounded-xl border border-slate-200 bg-white p-2.5 sm:p-3">
        <div className="mb-2 shrink-0 flex items-baseline justify-between gap-2">
          <p className="text-xs font-semibold text-slate-900">{rm.title}</p>
          <p className="hidden truncate text-[10px] text-slate-400 lg:block">
            {rm.subtitle}
          </p>
        </div>

        <div className="mb-2.5 shrink-0">
          <SectionLabel icon={<FileText className="h-3.5 w-3.5" />}>
            {rm.coreDocs}
          </SectionLabel>
          <div className="grid grid-cols-3 gap-1.5">
            {primary.map((item) =>
              item.link ? (
                <ResourceAnchor
                  key={item.key}
                  href={item.link.url}
                  className="justify-center font-semibold text-slate-900 sm:justify-start"
                >
                  {item.icon}
                  <span className="truncate">{item.title}</span>
                </ResourceAnchor>
              ) : (
                <div
                  key={item.key}
                  className="flex h-9 items-center justify-center rounded-lg border border-dashed border-slate-200 px-2 text-[10px] text-slate-300"
                >
                  {item.title}
                </div>
              )
            )}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-slate-100 bg-[#F8FAFC] p-2 sm:p-2.5">
          <SectionLabel icon={<ScrollText className="h-3.5 w-3.5" />}>
            {rm.certificates}
          </SectionLabel>
          {certificates.length ? (
            <div className="grid flex-1 auto-rows-min grid-cols-2 content-start gap-1.5 sm:grid-cols-3">
              {certificates.map((link) => (
                <ResourceAnchor
                  key={link.fileId + link.label}
                  href={link.url}
                  title={link.label}
                  className="h-10 justify-start border-slate-200/90 bg-white shadow-[0_1px_0_rgba(15,23,42,0.03)]"
                >
                  <ScrollText className="h-3.5 w-3.5 shrink-0 text-[#E40011]/75" />
                  <span className="truncate font-semibold text-slate-800">
                    {shortCertLabel(link)}
                  </span>
                </ResourceAnchor>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">{rm.certsEmpty}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">{rm.title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{rm.subtitle}</p>
      </div>

      <div>
        <SectionLabel icon={<FileText className="h-3.5 w-3.5" />}>
          {rm.coreDocs}
        </SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {primary.map((item) =>
            item.link ? (
              <ResourceAnchor
                key={item.key}
                href={item.link.url}
                className="border-slate-900/10 bg-white font-semibold text-slate-900"
              >
                {item.icon}
                <span className="truncate">{item.title}</span>
              </ResourceAnchor>
            ) : null
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-3">
        <SectionLabel icon={<ScrollText className="h-3.5 w-3.5" />}>
          {rm.certificates}
        </SectionLabel>
        {certificates.length ? (
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {certificates.map((link) => (
              <ResourceAnchor
                key={link.fileId + link.label}
                href={link.url}
                title={link.label}
                className="h-10"
              >
                <ScrollText className="h-3.5 w-3.5 shrink-0 text-[#E40011]/75" />
                <span className="truncate font-semibold">
                  {shortCertLabel(link)}
                </span>
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
