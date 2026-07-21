"use client";

import type { ReactNode } from "react";
import {
  ExternalLink,
  FileText,
  ImageIcon,
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
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition",
        "hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
        className
      )}
    >
      {children}
      <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
    </a>
  );
}

function ResourceGroup({
  title,
  icon,
  links,
  emptyText,
}: {
  title: string;
  icon: ReactNode;
  links: DriveResourceLink[];
  emptyText: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
        <span className="text-[#E40011]">{icon}</span>
        {title}
      </div>
      {links.length ? (
        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <ResourceAnchor key={link.fileId + link.label} href={link.url}>
              <span className="max-w-[220px] truncate">{link.label}</span>
            </ResourceAnchor>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400">{emptyText}</p>
      )}
    </div>
  );
}

export function ProductResourcesPanel({ seriesId }: { seriesId: string }) {
  const { m } = useI18n();
  const resources = getProductDriveResources(seriesId);
  const rm = m.recommend.resources;

  if (!resources) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
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
      icon: <FileText className="h-3.5 w-3.5" />,
      title: rm.datasheet,
    },
    {
      key: "warranty",
      link: resources.warranty,
      icon: <ShieldCheck className="h-3.5 w-3.5" />,
      title: rm.warranty,
    },
    {
      key: "im",
      link: resources.installationManual,
      icon: <Wrench className="h-3.5 w-3.5" />,
      title: rm.installationManual,
    },
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">{rm.title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{rm.subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-2">
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

      <ResourceGroup
        title={rm.photos}
        icon={<ImageIcon className="h-3.5 w-3.5" />}
        links={resources.photos}
        emptyText={rm.photosEmpty}
      />

      <ResourceGroup
        title={rm.certificates}
        icon={<ScrollText className="h-3.5 w-3.5" />}
        links={resources.certificates}
        emptyText={rm.certsEmpty}
      />
    </div>
  );
}
