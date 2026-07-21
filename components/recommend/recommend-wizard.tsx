"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { RecommendHero } from "@/components/recommend/recommend-hero";
import { RecommendStep1 } from "@/components/recommend/recommend-step1";
import { RecommendResult } from "@/components/recommend/recommend-result";
import type { AppLocale } from "@/lib/i18n";
import {
  DEFAULT_PRODUCT_RECOMMEND_INPUT,
  recommendProductSeries,
  weakAlternativeMatches,
  type ProductRecommendInput,
} from "@/lib/product-recommend-engine";

type Phase = "select" | "result";

export function RecommendWizard({
  locale,
  onLocaleChange,
}: {
  locale: AppLocale;
  onLocaleChange: (locale: AppLocale) => void;
}) {
  const [input, setInput] = useState<ProductRecommendInput>(
    DEFAULT_PRODUCT_RECOMMEND_INPUT
  );
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedSeriesId, setSelectedSeriesId] = useState("");

  const ranked = useMemo(() => recommendProductSeries(input), [input]);
  const primary = ranked[0];
  const alternatives = useMemo(
    () => weakAlternativeMatches(input, undefined, 3),
    [input]
  );

  const handleApply = () => {
    if (!primary) return;
    setSelectedSeriesId(primary.series.id);
    setPhase("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setPhase("select");
    requestAnimationFrame(() => {
      document.getElementById("recommend-step1")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AnimatePresence mode="wait">
        {phase === "select" ? (
          <div key="select">
            <RecommendHero locale={locale} onLocaleChange={onLocaleChange} />
            <RecommendStep1
              input={input}
              onChange={setInput}
              onApply={handleApply}
            />
          </div>
        ) : primary ? (
          <RecommendResult
            key="result"
            primary={primary}
            alternatives={alternatives}
            selectedSeriesId={selectedSeriesId || primary.series.id}
            onSelectSeries={setSelectedSeriesId}
            onBack={handleBack}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
