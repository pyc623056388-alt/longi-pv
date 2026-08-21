"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Calculator,
  ChevronDown,
  Compass,
  Images,
  LayoutGrid,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/components/locale-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isToolboxPath, SITE_TOOLBOX_ITEMS } from "@/lib/site-toolbox";
import { cn } from "@/lib/utils";

const TOOL_ICONS: Record<(typeof SITE_TOOLBOX_ITEMS)[number]["id"], LucideIcon> =
  {
    "string-calculator": Calculator,
  };

const NAV_ITEM =
  "relative inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:gap-2 sm:px-3 sm:py-2 sm:text-sm";

function NavInk() {
  return (
    <motion.span
      layoutId="site-tool-nav-ink"
      className="absolute inset-x-1.5 -bottom-0.5 h-[2px] rounded-full bg-[#E40011] sm:inset-x-2"
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
    />
  );
}

function NavIcon({
  icon: Icon,
  active,
}: {
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Icon
      className={cn(
        "h-3.5 w-3.5 shrink-0 transition-opacity",
        active ? "opacity-100" : "opacity-70"
      )}
      strokeWidth={1.75}
    />
  );
}

function ToolboxNavItem({
  pathname,
  label,
  hint,
  active,
}: {
  pathname: string;
  label: string;
  hint: string;
  active: boolean;
}) {
  const { m } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        title={hint}
        className={cn(
          NAV_ITEM,
          "group outline-none",
          active ? "text-white" : "text-white/55 hover:text-white/90"
        )}
      >
        {active ? <NavInk /> : null}
        <NavIcon icon={Wrench} active={active} />
        <span className="relative whitespace-nowrap">{label}</span>
        <ChevronDown
          className="relative h-3 w-3 shrink-0 opacity-70 transition-transform duration-200 group-data-[state=open]:rotate-180"
          strokeWidth={2}
          aria-hidden
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="min-w-56 border-white/10 bg-[#0f172a] p-1.5 text-white shadow-xl"
      >
        {SITE_TOOLBOX_ITEMS.map((tool) => {
          const Icon = TOOL_ICONS[tool.id];
          const current =
            pathname === tool.href || pathname.startsWith(`${tool.href}/`);
          return (
            <DropdownMenuItem key={tool.id} asChild>
              <Link
                href={tool.href}
                className={cn(
                  "cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 text-sm text-white/80 focus:bg-white/10 focus:text-white",
                  current && "bg-white/10 text-white"
                )}
              >
                <Icon
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#ff8080]"
                  strokeWidth={1.75}
                />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-medium">{m.nav[tool.labelKey]}</span>
                  <span className="text-xs font-normal text-white/45">
                    {m.nav[tool.hintKey]}
                  </span>
                </span>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SiteToolNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const { m } = useI18n();
  const toolboxActive = isToolboxPath(pathname);

  /** 左→右：案例 → 产品展示 → 选型 → 对比 → 工具包 */
  const items = [
    {
      href: "/cases",
      label: m.nav.cases,
      hint: m.nav.casesHint,
      icon: Images,
      active: pathname === "/cases" || pathname.startsWith("/cases/"),
    },
    {
      href: "/products",
      label: m.nav.products,
      hint: m.nav.productsHint,
      icon: LayoutGrid,
      active: pathname === "/products" || pathname.startsWith("/products/"),
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
                NAV_ITEM,
                item.active ? "text-white" : "text-white/55 hover:text-white/90"
              )}
            >
              {item.active ? <NavInk /> : null}
              <NavIcon icon={Icon} active={item.active} />
              <span className="relative whitespace-nowrap">{item.label}</span>
            </Link>
          </div>
        );
      })}
      <div className="flex items-center">
        <span
          aria-hidden
          className="mx-0.5 h-px w-3 bg-white/20 sm:mx-1 sm:w-4"
        />
        <ToolboxNavItem
          pathname={pathname}
          label={m.nav.toolbox}
          hint={m.nav.toolboxHint}
          active={toolboxActive}
        />
      </div>
    </nav>
  );
}
