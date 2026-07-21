"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Check,
  Home,
  Layers,
  Scale,
  Sparkles,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiteToolNav } from "@/components/site-tool-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/components/locale-provider";
import type { AppLocale } from "@/lib/i18n";
import {
  DEFAULT_PRODUCT_RECOMMEND_INPUT,
  recommendProductSeries,
  type ProductRecommendInput,
  type RecommendFeatureNeed,
  type RecommendPowerPref,
  type RecommendRoofLoad,
  type RecommendScenario,
} from "@/lib/product-recommend-engine";
import type { ProductGeneration } from "@/lib/product-matrix-catalog";
import { cn } from "@/lib/utils";

const FIELD_TRIGGER =
  "h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-medium text-[#1A202C] shadow-none hover:border-slate-300 focus-visible:ring-4 focus-visible:ring-slate-900/[0.08]";

const FEATURE_NEEDS: RecommendFeatureNeed[] = [
  "antiHotspot",
  "antiDust",
  "antiGlare",
  "antiShading",
  "lightweight",
  "saltMist",
  "ammonia",
  "hail",
];

function compareHrefForModel(model: string): string {
  return `/?longiModel=${encodeURIComponent(model)}`;
}

export function RecommendWizard({
  locale,
  onLocaleChange,
}: {
  locale: AppLocale;
  onLocaleChange: (locale: AppLocale) => void;
}) {
  const { m } = useI18n();
  const [input, setInput] = useState<ProductRecommendInput>(
    DEFAULT_PRODUCT_RECOMMEND_INPUT
  );

  const ranked = useMemo(() => recommendProductSeries(input), [input]);
  const top = ranked[0];
  const runners = ranked.slice(1, 3);

  const setScenario = (scenario: RecommendScenario) =>
    setInput((prev) => ({ ...prev, scenario }));
  const setRoofLoad = (roofLoad: RecommendRoofLoad) =>
    setInput((prev) => ({ ...prev, roofLoad }));
  const setGeneration = (generation: ProductGeneration | "any") =>
    setInput((prev) => ({ ...prev, generation }));
  const setPowerPref = (powerPref: RecommendPowerPref) =>
    setInput((prev) => ({ ...prev, powerPref }));
  const toggleNeed = (need: RecommendFeatureNeed, checked: boolean) =>
    setInput((prev) => ({
      ...prev,
      needs: { ...prev.needs, [need]: checked },
    }));

  const rm = m.recommend;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-100 text-slate-900">
      <header className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(ellipse_at_top,_rgba(228,0,17,0.28),_transparent_55%),linear-gradient(180deg,#0b1220_0%,#111827_100%)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 pb-14 pt-6 sm:pb-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-3">
              <Image
                src="/longi-logo.svg"
                alt="LONGi"
                width={86}
                height={40}
                priority
                className="h-8 w-auto shrink-0"
              />
              <div className="sm:hidden">
                <LanguageSwitcher locale={locale} onLocaleChange={onLocaleChange} />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
              <SiteToolNav />
              <div className="hidden sm:block">
                <LanguageSwitcher locale={locale} onLocaleChange={onLocaleChange} />
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-3xl"
          >
            <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-[#ff8080] uppercase">
              {rm.eyebrow}
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {rm.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {rm.subtitle}
            </p>
          </motion.div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-12 lg:py-14">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-5 lg:col-span-5"
        >
          <FormBlock title={rm.sections.scenario} icon={<Home className="h-4 w-4" />}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(
                [
                  ["residential", rm.scenario.residential],
                  ["commercial", rm.scenario.commercial],
                  ["flexible", rm.scenario.flexible],
                ] as const
              ).map(([value, label]) => (
                <ChoiceChip
                  key={value}
                  active={input.scenario === value}
                  onClick={() => setScenario(value)}
                  label={label}
                />
              ))}
            </div>
          </FormBlock>

          <FormBlock title={rm.sections.roofLoad} icon={<Scale className="h-4 w-4" />}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(
                [
                  ["normal", rm.roofLoad.normal],
                  ["limited", rm.roofLoad.limited],
                ] as const
              ).map(([value, label]) => (
                <ChoiceChip
                  key={value}
                  active={input.roofLoad === value}
                  onClick={() => setRoofLoad(value)}
                  label={label}
                />
              ))}
            </div>
          </FormBlock>

          <FormBlock title={rm.sections.generation} icon={<Layers className="h-4 w-4" />}>
            <Select
              value={input.generation}
              onValueChange={(v) =>
                setGeneration(v as ProductGeneration | "any")
              }
            >
              <SelectTrigger className={FIELD_TRIGGER}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">{rm.generation.any}</SelectItem>
                <SelectItem value="monofacial">{rm.generation.monofacial}</SelectItem>
                <SelectItem value="bifacial">{rm.generation.bifacial}</SelectItem>
                <SelectItem value="transparent">{rm.generation.transparent}</SelectItem>
              </SelectContent>
            </Select>
          </FormBlock>

          <FormBlock title={rm.sections.power} icon={<Building2 className="h-4 w-4" />}>
            <Select
              value={input.powerPref}
              onValueChange={(v) => setPowerPref(v as RecommendPowerPref)}
            >
              <SelectTrigger className={FIELD_TRIGGER}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">{rm.power.auto}</SelectItem>
                <SelectItem value="residential">{rm.power.residential}</SelectItem>
                <SelectItem value="medium">{rm.power.medium}</SelectItem>
                <SelectItem value="large">{rm.power.large}</SelectItem>
              </SelectContent>
            </Select>
          </FormBlock>

          <FormBlock title={rm.sections.needs} icon={<Sparkles className="h-4 w-4" />}>
            <div className="space-y-2">
              {FEATURE_NEEDS.map((need) => (
                <label
                  key={need}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-slate-50",
                    input.needs[need] && "bg-slate-50"
                  )}
                >
                  <Checkbox
                    checked={Boolean(input.needs[need])}
                    onCheckedChange={(v) => toggleNeed(need, v === true)}
                    className="mt-0.5 border-slate-300 data-[state=checked]:border-[#E40011] data-[state=checked]:bg-[#E40011]"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-900">
                      {rm.needs[need].label}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {rm.needs[need].hint}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </FormBlock>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="lg:col-span-7"
        >
          <div className="sticky top-6 space-y-5">
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  {rm.result.badge}
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                  {rm.result.title}
                </h2>
              </div>

              {top ? (
                <div className="grid gap-0 md:grid-cols-5">
                  <div className="relative min-h-[240px] bg-slate-950 md:col-span-2">
                    {top.series.imageSrc ? (
                      <Image
                        src={top.series.imageSrc}
                        alt={top.series.modelFamily}
                        fill
                        className="object-contain object-center p-4"
                        sizes="(max-width: 768px) 100vw, 280px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-400">
                        {top.series.modelFamily}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 p-6 md:col-span-3">
                    <div>
                      <p className="text-sm font-medium text-[#E40011]">
                        {locale === "zh" ? top.series.nameZh : top.series.nameEn}
                      </p>
                      <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                        {top.series.representativeModel}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {top.series.powerMinWp}–{top.series.powerMaxWp} W ·{" "}
                        {top.series.dimensionMm} mm
                      </p>
                    </div>

                    <ul className="flex flex-wrap gap-2">
                      {(locale === "zh"
                        ? top.series.highlightsZh
                        : top.series.highlightsEn
                      ).map((h) => (
                        <li
                          key={h}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {h}
                        </li>
                      ))}
                    </ul>

                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      <SpecItem label={rm.result.efficiency} value={`${top.series.efficiencyMaxPct}%`} />
                      <SpecItem label={rm.result.weight} value={`${top.series.weightKg} kg`} />
                      <SpecItem label={rm.result.tempCoef} value={`${top.series.pmpTempCoef}%/°C`} />
                      <SpecItem
                        label={rm.result.degradation}
                        value={`${top.series.firstYearDegradationPct}% / ${top.series.annualDegradationPct}%`}
                      />
                      <SpecItem
                        label={rm.result.warranty}
                        value={`${top.series.productWarrantyYears}Y / ${top.series.performanceWarrantyYears}Y`}
                      />
                      <SpecItem
                        label={rm.result.glass}
                        value={
                          top.series.glass === "dual"
                            ? rm.result.dualGlass
                            : rm.result.singleGlass
                        }
                      />
                    </dl>

                    {(locale === "zh" ? top.reasonsZh : top.reasonsEn).length > 0 && (
                      <ul className="space-y-1.5">
                        {(locale === "zh" ? top.reasonsZh : top.reasonsEn).map((r) => (
                          <li
                            key={r}
                            className="flex items-start gap-2 text-sm text-slate-600"
                          >
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex flex-wrap gap-3 pt-1">
                      <Link
                        href={compareHrefForModel(top.series.representativeModel)}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#E40011] px-5 text-sm font-semibold text-white transition hover:bg-[#C4000F]"
                      >
                        {rm.result.openCompare}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-16 text-center text-sm text-slate-500">
                  {rm.result.empty}
                </div>
              )}
            </div>

            {runners.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {runners.map((item) => (
                  <Link
                    key={item.series.id}
                    href={compareHrefForModel(item.series.representativeModel)}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                  >
                    <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                      {rm.result.alternative}
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {item.series.representativeModel}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.series.powerMinWp}–{item.series.powerMaxWp} W ·{" "}
                      {locale === "zh" ? item.series.nameZh : item.series.nameEn}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.section>
      </main>
    </div>
  );
}

function FormBlock({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E40011]/10 text-[#E40011]">
          {icon}
        </span>
        <Label className="text-sm font-semibold text-slate-800">{title}</Label>
      </div>
      {children}
    </div>
  );
}

function ChoiceChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition",
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
      )}
    >
      {label}
    </button>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <dt className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">
        {value}
      </dd>
    </div>
  );
}
