"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/locale-provider";

export function SiteToolNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const { m } = useI18n();

  const items = [
    {
      href: "/",
      label: m.nav.compare,
      hint: m.nav.compareHint,
      icon: BarChart3,
      active: pathname === "/",
    },
    {
      href: "/recommend",
      label: m.nav.recommend,
      hint: m.nav.recommendHint,
      icon: Compass,
      active: pathname === "/recommend" || pathname.startsWith("/recommend/"),
    },
  ] as const;

  return (
    <nav
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-full border border-white/15 bg-black/35 p-1 backdrop-blur-md",
        className
      )}
      aria-label={m.nav.aria}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.hint}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-colors sm:gap-2 sm:px-3.5 sm:text-sm",
              item.active
                ? "bg-white text-slate-900"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            <span className="whitespace-nowrap">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
