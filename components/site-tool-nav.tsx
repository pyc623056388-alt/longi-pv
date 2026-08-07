"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart3, Compass, Images } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/locale-provider";

export function SiteToolNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const { m } = useI18n();

  /** 左→右：案例 → 选型 → 对比（浏览 → 选型 → 测算） */
  const items = [
    {
      href: "/cases",
      label: m.nav.cases,
      hint: m.nav.casesHint,
      icon: Images,
      active: pathname === "/cases" || pathname.startsWith("/cases/"),
    },
    {
      href: "/recommend",
      label: m.nav.recommend,
      hint: m.nav.recommendHint,
      icon: Compass,
      active: pathname === "/recommend" || pathname.startsWith("/recommend/"),
    },
    {
      href: "/",
      label: m.nav.compare,
      hint: m.nav.compareHint,
      icon: BarChart3,
      active: pathname === "/",
    },
  ] as const;

  return (
    <nav
      className={cn(
        "inline-flex max-w-full items-center gap-0.5 sm:gap-1",
        className
      )}
      aria-label={m.nav.aria}
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={item.href} className="flex items-center">
            {index > 0 ? (
              <span
                aria-hidden
                className="mx-0.5 h-px w-3 bg-white/20 sm:mx-1 sm:w-4"
              />
            ) : null}
            <Link
              href={item.href}
              title={item.hint}
              className={cn(
                "relative inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:gap-2 sm:px-3 sm:py-2 sm:text-sm",
                item.active
                  ? "text-white"
                  : "text-white/55 hover:text-white/90"
              )}
            >
              {item.active ? (
                <motion.span
                  layoutId="site-tool-nav-ink"
                  className="absolute inset-x-1.5 -bottom-0.5 h-[2px] rounded-full bg-[#E40011] sm:inset-x-2"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              ) : null}
              <Icon
                className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-opacity",
                  item.active ? "opacity-100" : "opacity-70"
                )}
                strokeWidth={1.75}
              />
              <span className="relative whitespace-nowrap">{item.label}</span>
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
