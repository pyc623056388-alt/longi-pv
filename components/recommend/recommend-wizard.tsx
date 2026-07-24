"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { RecommendHero } from "@/components/recommend/recommend-hero";
import { RecommendStep1 } from "@/components/recommend/recommend-step1";
import { RecommendResult } from "@/components/recommend/recommend-result";
import type { AppLocale } from "@/lib/i18n";
import { getProductSeriesById } from "@/lib/product-matrix-catalog";
import {
  DEFAULT_PRODUCT_RECOMMEND_INPUT,
  recommendProductSeries,
  type ProductRecommendInput,
} from "@/lib/product-recommend-engine";
import {
  defaultPowerBandForSeries,
  type ResultPowerBand,
} from "@/lib/product-sku-catalog";

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
  const [powerBand, setPowerBand] = useState<ResultPowerBand>("default");

  /** Deep-link from cases: /recommend?series=LR7-54HVH */
  useEffect(() => {
    const seriesId = new URLSearchParams(window.location.search).get("series");
    if (!seriesId) return;
    const series = getProductSeriesById(seriesId);
    if (!series) return;

    setInput({
      ...DEFAULT_PRODUCT_RECOMMEND_INPUT,
      scenario: "flexible",
    });
    setSelectedSeriesId(series.id);
    setPowerBand(defaultPowerBandForSeries(series));
    setPhase("result");

    const url = new URL(window.location.href);
    url.searchParams.delete("series");
    window.history.replaceState({}, "", `${url.pathname}${url.hash}`);
  }, []);

  const ranked = useMemo(() => recommendProductSeries(input), [input]);
  const primary = ranked[0];
  const alternatives = ranked.slice(1, 4);

  const handleApply = () => {
    if (!primary) return;
    setSelectedSeriesId(primary.series.id);
    setPowerBand(defaultPowerBandForSeries(primary.series));
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
            powerBand={powerBand}
            onSelectSeries={setSelectedSeriesId}
            onSelectPowerBand={setPowerBand}
            onBack={handleBack}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
