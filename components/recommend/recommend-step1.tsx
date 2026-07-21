"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/components/locale-provider";
import {
  countMatches,
  isOptionFeasible,
  type ProductRecommendInput,
  type RecommendFeatureNeed,
  type RecommendScenario,
} from "@/lib/product-recommend-engine";
import type { ProductGeneration } from "@/lib/product-matrix-catalog";
import { cn } from "@/lib/utils";

/** Step1 可勾选功能（不含与场景重复的抗热斑/抗遮挡；承重由轻质需求表达） */
const FEATURE_NEEDS: RecommendFeatureNeed[] = [
  "antiDust",
  "antiGlare",
  "lightweight",
  "saltMist",
  "ammonia",
  "hail",
];

const FIELD_TRIGGER =
  "w-full h-auto px-5 py-3.5 bg-white/80 rounded-2xl shadow-lg shadow-slate-200/50 text-base border-0 hover:bg-white/80";

interface RecommendStep1Props {
  input: ProductRecommendInput;
  onChange: (next: ProductRecommendInput) => void;
  onApply: () => void;
}

export function RecommendStep1({ input, onChange, onApply }: RecommendStep1Props) {
  const { m } = useI18n();
  const rm = m.recommend;
  const matchN = useMemo(() => countMatches(input), [input]);

  const setScenario = (scenario: RecommendScenario) => {
    if (!isOptionFeasible(input, { scenario })) return;
    onChange({ ...input, scenario });
  };
  const setGeneration = (generation: ProductGeneration | "any") => {
    if (!isOptionFeasible(input, { generation })) return;
    onChange({ ...input, generation });
  };
  const toggleNeed = (need: RecommendFeatureNeed, checked: boolean) => {
    if (!isOptionFeasible(input, { needs: { [need]: checked } })) return;
    onChange({
      ...input,
      needs: { ...input.needs, [need]: checked },
    });
  };

  const scenarios: RecommendScenario[] = ["residential", "commercial", "flexible"];

  return (
    <motion.section
      id="recommend-step1"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      className="flex min-h-[100dvh] scroll-mt-4 flex-col justify-center bg-gradient-to-b from-slate-50 to-white py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-5xl px-6">
        <div className="mb-8 text-center sm:mb-10">
          <span className="mb-3 inline-block rounded-full bg-[#E40011]/10 px-4 py-1.5 text-sm font-semibold text-[#E40011]">
            {rm.stepBadge}
          </span>
          <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            {rm.stepTitle}
          </h2>
          <p className="text-base text-slate-500">{rm.stepSubtitle}</p>
        </div>

        <div className="mb-6">
          <h3 className="mb-4 text-center text-base font-bold text-slate-900">
            {rm.sections.scenario}
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            {scenarios.map((id) => {
              const disabled =
                id !== input.scenario && !isOptionFeasible(input, { scenario: id });
              const active = input.scenario === id;
              return (
                <ChoiceCard
                  key={id}
                  active={active}
                  disabled={disabled}
                  title={rm.scenario[id]}
                  desc={rm.scenarioDesc[id]}
                  disabledHint={rm.optionDisabled}
                  onClick={() => setScenario(id)}
                />
              );
            })}
          </div>
        </div>

        <div className="mb-6 max-w-md space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            {rm.sections.generation}
          </label>
          <Select
            value={input.generation}
            onValueChange={(v) => setGeneration(v as ProductGeneration | "any")}
          >
            <SelectTrigger className={FIELD_TRIGGER}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(
                ["any", "monofacial", "bifacial", "transparent"] as const
              ).map((id) => {
                const disabled =
                  id !== input.generation &&
                  !isOptionFeasible(input, { generation: id });
                return (
                  <SelectItem key={id} value={id} disabled={disabled}>
                    {rm.generation[id]}
                    {disabled ? ` · ${rm.optionDisabled}` : ""}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="mb-8 rounded-3xl bg-white p-5 shadow-lg shadow-slate-200/50 sm:p-6">
          <h3 className="mb-1 text-base font-bold text-slate-900">
            {rm.sections.needs}
          </h3>
          <p className="mb-4 text-sm text-slate-500">{rm.formHint}</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_NEEDS.map((need) => {
              const checked = Boolean(input.needs[need]);
              const disabled =
                !checked &&
                !isOptionFeasible(input, { needs: { [need]: true } });
              return (
                <label
                  key={need}
                  title={disabled ? rm.optionDisabled : undefined}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border px-3.5 py-2.5 transition",
                    checked
                      ? "border-[#E40011]/40 bg-[#E40011]/[0.04]"
                      : "border-slate-100 bg-slate-50/80",
                    disabled
                      ? "cursor-not-allowed opacity-45"
                      : "cursor-pointer hover:border-slate-200"
                  )}
                >
                  <Checkbox
                    checked={checked}
                    disabled={disabled}
                    onCheckedChange={(v) => toggleNeed(need, v === true)}
                    className="mt-0.5 border-slate-300 data-[state=checked]:border-[#E40011] data-[state=checked]:bg-[#E40011]"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900">
                      {rm.needs[need].label}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {disabled ? rm.optionDisabled : rm.needs[need].hint}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <p
            className={cn(
              "text-sm font-medium",
              matchN > 0 ? "text-slate-600" : "text-amber-700"
            )}
          >
            {matchN > 0 ? rm.matchCount(matchN) : rm.matchNone}
          </p>
          <button
            type="button"
            disabled={matchN === 0}
            onClick={onApply}
            className={cn(
              "inline-flex h-12 min-w-[220px] items-center justify-center rounded-2xl px-8 text-base font-bold text-white transition",
              matchN > 0
                ? "bg-[#E40011] hover:bg-[#C4000F] active:scale-[0.99]"
                : "cursor-not-allowed bg-slate-300"
            )}
          >
            {rm.apply}
          </button>
        </div>
      </div>
    </motion.section>
  );
}

function ChoiceCard({
  active,
  disabled,
  title,
  desc,
  disabledHint,
  onClick,
}: {
  active: boolean;
  disabled: boolean;
  title: string;
  desc: string;
  disabledHint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={disabled ? disabledHint : undefined}
      onClick={onClick}
      className={cn(
        "relative rounded-2xl p-5 text-left transition-all sm:p-6",
        active
          ? "bg-white shadow-xl ring-2 ring-[#E40011]"
          : "bg-white/50 shadow-md hover:shadow-lg",
        disabled && "cursor-not-allowed opacity-40 hover:shadow-md"
      )}
    >
      {active && (
        <div className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#E40011]">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}
      <h4
        className={cn(
          "mb-1 text-lg font-bold",
          active ? "text-[#E40011]" : "text-slate-900"
        )}
      >
        {title}
      </h4>
      <p className="text-sm text-slate-500">{disabled ? disabledHint : desc}</p>
    </button>
  );
}
