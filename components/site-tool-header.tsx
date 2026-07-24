"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { SiteToolNav } from "@/components/site-tool-nav";
import { cn } from "@/lib/utils";

/**
 * Shared dark-hero header: logo + utilities on row 1, tool flow nav on row 2.
 * Keeps the tab strip from competing with language / account controls.
 */
export function SiteToolHeader({
  utilities,
  className,
  navAlign = "start",
}: {
  utilities?: ReactNode;
  className?: string;
  navAlign?: "start" | "center";
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <Image
          src="/longi-logo.svg"
          alt="LONGi"
          width={86}
          height={40}
          priority
          className="h-8 w-auto shrink-0"
        />
        {utilities ? (
          <div className="flex min-w-0 items-center justify-end gap-2">
            {utilities}
          </div>
        ) : null}
      </div>
      <div
        className={cn(
          "flex",
          navAlign === "center" ? "justify-center" : "justify-start"
        )}
      >
        <SiteToolNav />
      </div>
    </div>
  );
}
