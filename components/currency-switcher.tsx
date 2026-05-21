"use client";

import { Coins, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CURRENCY_LABELS, type CurrencyCode } from "@/lib/pv-types";

const CURRENCIES = Object.keys(CURRENCY_LABELS) as CurrencyCode[];

const heroButtonClass =
  "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white";

interface CurrencySwitcherProps {
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  variant?: "hero" | "default";
}

export function CurrencySwitcher({
  currency,
  onCurrencyChange,
  variant = "default",
}: CurrencySwitcherProps) {
  const btnClass = variant === "hero" ? heroButtonClass : undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={btnClass}>
          <Coins className="w-4 h-4 mr-2" />
          {currency}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {CURRENCIES.map((c) => (
          <DropdownMenuItem
            key={c}
            onClick={() => onCurrencyChange(c)}
            className="flex items-center justify-between gap-4"
          >
            <span>{CURRENCY_LABELS[c]}</span>
            {c === currency && <Check className="w-4 h-4 text-[#E40011]" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
