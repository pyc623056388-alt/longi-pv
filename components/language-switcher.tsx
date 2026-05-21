"use client";

import { Languages, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type AppLocale = "zh" | "en";

const LOCALE_OPTIONS: { id: AppLocale; label: string }[] = [
  { id: "zh", label: "中文" },
  { id: "en", label: "English" },
];

const heroButtonClass =
  "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white";

interface LanguageSwitcherProps {
  locale: AppLocale;
  onLocaleChange: (locale: AppLocale) => void;
  variant?: "hero" | "default";
}

export function LanguageSwitcher({
  locale,
  onLocaleChange,
  variant = "default",
}: LanguageSwitcherProps) {
  const btnClass = variant === "hero" ? heroButtonClass : undefined;
  const displayLabel = locale === "zh" ? "中文" : "EN";

  const handleSelect = (next: AppLocale) => {
    onLocaleChange(next);
    if (next === "en") {
      toast.info("英文界面即将推出");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={btnClass}>
          <Languages className="w-4 h-4 mr-2" />
          {displayLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALE_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.id}
            onClick={() => handleSelect(opt.id)}
            className="flex items-center justify-between gap-4"
          >
            <span>{opt.label}</span>
            {opt.id === locale && <Check className="w-4 h-4 text-[#E40011]" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
