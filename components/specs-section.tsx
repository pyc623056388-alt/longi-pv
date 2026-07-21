"use client";

import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Layers, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ModulePairPresetId } from "@/lib/module-pair-presets";
import { MODULE_PAIR_PRESET_IDS } from "@/lib/module-pair-presets";
import { useI18n } from "@/components/locale-provider";
import { SpecParamEditSheet } from "@/components/spec-param-edit-sheet";
import type { ModuleSpec } from "@/lib/pv-calculation";
import {
  formatPricePerWParts,
  formatSpecDisplayValue,
  isSpecFieldUsingDefault,
  longiSpecAdvantageVariant,
  longiSpecValueColorClass,
  moduleDisplayName,
  type ModuleSpecField,
  type PricePerWParts,
} from "@/lib/module-utils";
import { LONGI_PRODUCT_HERO_IMAGE } from "@/lib/product-graphics";
import type { CurrencyCode, ModuleRecord } from "@/lib/pv-types";
import { CURRENCY_SYMBOLS } from "@/lib/pv-types";

/** 配置区下拉统一：浅灰描边、悬停/聚焦过渡、深色正文 */
const SPECS_SELECTOR_TRIGGER_CLASS = cn(
  "w-full h-12 rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-medium text-[#1A202C] shadow-none",
  "transition-[border-color,box-shadow,background-color] duration-200 ease-out",
  "hover:border-slate-300 hover:bg-[#FAFBFC]",
  "focus-visible:border-slate-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900/[0.08]",
  "aria-expanded:border-slate-500 aria-expanded:ring-4 aria-expanded:ring-slate-900/[0.06]",
  "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[1.75] [&_svg]:text-slate-400",
  "data-[placeholder]:text-slate-400 [&_span]:text-[#1A202C]"
);

const SPECS_SELECTOR_CARD_CLASS = cn(
  "flex h-full w-full min-w-0 flex-col rounded-2xl bg-white p-5",
  "shadow-[0_4px_20px_rgba(0,0,0,0.05)]",
  "transition-shadow duration-300 ease-out",
  "hover:shadow-[0_8px_28px_rgba(0,0,0,0.07)]"
);

const SPECS_SELECTOR_LABEL_CLASS =
  "text-left text-xs font-medium tracking-wide text-[#4A5568]";

const SPEC_FIELDS: ModuleSpecField[] = [
  "power",
  "dimensions",
  "tempCoef",
  "firstYearDeg",
  "annualDeg",
  "price",
];

interface SpecsSectionProps {
  longi: ModuleSpec;
  competitor: ModuleSpec;
  longiBase: ModuleSpec;
  competitorBase: ModuleSpec;
  overriddenFields: { longi: ModuleSpecField[]; competitor: ModuleSpecField[] };
  longiModules: ModuleRecord[];
  competitorModules: ModuleRecord[];
  selectedLongiId: string;
  selectedCompetitorId: string;
  onSelectLongi: (id: string) => void;
  onSelectCompetitor: (id: string) => void;
  modulePairPreset: ModulePairPresetId;
  onModulePairPresetChange: (preset: ModulePairPresetId) => void;
  currency: CurrencyCode;
  longiRecord?: ModuleRecord;
  compRecord?: ModuleRecord;
  onApplyOverride: (
    field: ModuleSpecField,
    values: { longi: string; competitor: string }
  ) => void;
  onResetOverride: (field: ModuleSpecField) => void;
  onSaveToLibrary: (
    field: ModuleSpecField,
    values: { longi: string; competitor: string }
  ) => void;
}

function rawValueForField(spec: ModuleSpec, field: ModuleSpecField): string {
  return spec[field] ?? "";
}

function PricePerWCompareValue({
  parts,
  colorClass,
  sizeClass,
  alignClass,
  showDefaultHint,
}: {
  parts: PricePerWParts;
  colorClass: string;
  sizeClass: string;
  alignClass: string;
  showDefaultHint?: boolean;
}) {
  const { m } = useI18n();
  if (parts.unset) {
    return (
      <span className={`${sizeClass} font-extrabold tabular-nums ${colorClass} ${alignClass}`}>
        {m.common.notSet}
      </span>
    );
  }
  return (
    <span className={`block min-w-0 ${alignClass}`}>
      <span className={`${sizeClass} font-extrabold tabular-nums leading-tight ${colorClass}`}>
        {parts.perW}
      </span>
      {parts.perPanel && (
        <span className="block text-sm font-normal text-slate-500 tabular-nums leading-snug mt-0.5">
          {parts.perPanel}
        </span>
      )}
      {showDefaultHint && (
        <span className="block text-xs font-normal text-slate-400 mt-0.5">
          {m.common.defaultValue}
        </span>
      )}
    </span>
  );
}

function SpecCompareValue({
  display,
  parts,
  colorClass,
  isPrice,
  align,
  showDefaultHint,
}: {
  display: string;
  parts?: PricePerWParts;
  colorClass: string;
  isPrice: boolean;
  align: "left" | "right";
  showDefaultHint?: boolean;
}) {
  const { m } = useI18n();
  const alignClass = isPrice
    ? `${align === "right" ? "text-right" : "text-left"} max-sm:text-center`
    : align === "right"
      ? "text-right"
      : "text-left";
  const longiSize = isPrice ? "text-xl sm:text-2xl" : "text-3xl";
  const compSize = isPrice ? "text-lg sm:text-xl" : "text-2xl";

  if (isPrice && parts) {
    return (
      <PricePerWCompareValue
        parts={parts}
        colorClass={colorClass}
        sizeClass={align === "right" ? longiSize : compSize}
        alignClass={alignClass}
        showDefaultHint={showDefaultHint}
      />
    );
  }

  return (
    <span
      className={`block min-w-0 whitespace-normal break-words ${alignClass} ${
        align === "right" ? `${longiSize} font-extrabold` : `${compSize} font-bold`
      } tabular-nums ${colorClass}`}
    >
      {display}
      {showDefaultHint && (
        <span className="block text-xs font-normal text-slate-400">
          {m.common.defaultValue}
        </span>
      )}
    </span>
  );
}

function SpecsSelectorCard({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(SPECS_SELECTOR_CARD_CLASS, className)}>
      <div className="mb-3.5 flex h-8 w-full shrink-0 items-center justify-start gap-2.5">
        {icon}
        <span className={SPECS_SELECTOR_LABEL_CLASS}>{title}</span>
      </div>
      <div className="min-h-12 shrink-0">{children}</div>
    </div>
  );
}

function ModulePairPresetControl({
  value,
  onChange,
  className,
}: {
  value: ModulePairPresetId;
  onChange: (preset: ModulePairPresetId) => void;
  className?: string;
}) {
  const { m } = useI18n();
  const isQuickPreset = value !== "custom";

  const icon = (
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
        isQuickPreset ? "bg-slate-900/[0.06]" : "bg-[#F1F5F9]"
      )}
    >
      <Layers
        className={cn(
          "h-4 w-4 stroke-[1.75]",
          isQuickPreset ? "text-slate-800" : "text-slate-500"
        )}
      />
    </span>
  );

  return (
    <SpecsSelectorCard
      title={m.specs.modulePairPreset}
      icon={icon}
      className={className}
    >
      <Select
        value={value}
        onValueChange={(v) => onChange(v as ModulePairPresetId)}
      >
        <SelectTrigger
          className={cn(
            SPECS_SELECTOR_TRIGGER_CLASS,
            "[&_[data-slot=select-value]]:font-medium [&_[data-slot=select-value]]:text-[#1A202C]"
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="custom">
            {m.specs.modulePairPresetOptions.custom}
          </SelectItem>
          {MODULE_PAIR_PRESET_IDS.map((id) => (
            <SelectItem key={id} value={id}>
              {m.specs.modulePairPresetOptions[id]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SpecsSelectorCard>
  );
}

export function SpecsSection({
  longi,
  competitor,
  longiBase,
  competitorBase,
  overriddenFields,
  longiModules,
  competitorModules,
  selectedLongiId,
  selectedCompetitorId,
  onSelectLongi,
  onSelectCompetitor,
  modulePairPreset,
  onModulePairPresetChange,
  currency,
  longiRecord,
  compRecord,
  onApplyOverride,
  onResetOverride,
  onSaveToLibrary,
}: SpecsSectionProps) {
  const { m, locale } = useI18n();
  const specDisplayOpts = {
    notSet: m.common.notSet,
    panelUnit: m.common.perModuleUnit,
  };
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [100, 0, 0, -100]);

  const sym = CURRENCY_SYMBOLS[currency];
  const [editingField, setEditingField] = useState<ModuleSpecField | null>(null);

  const longiRecordDisplay = longiModules.find((m) => m.id === selectedLongiId);
  const badgeName = longiRecordDisplay
    ? longiRecordDisplay.model.slice(0, 24)
    : m.common.longiModule;
  const isOverridden = (side: "longi" | "competitor", field: ModuleSpecField) =>
    overriddenFields[side].includes(field);

  return (
    <motion.section
      ref={ref}
      style={{ opacity, y }}
      className="min-h-screen flex items-center py-32 bg-gradient-to-b from-white via-slate-50 to-white"
    >
      <div className="max-w-7xl mx-auto px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 lg:mb-10"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#E40011]/10 text-[#E40011] text-sm font-semibold mb-4">
            {m.specs.stepBadge}
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            {m.specs.title}
          </h2>
          <p className="text-slate-500">{m.specs.subtitle}</p>
        </motion.div>

        <div className="mt-2 mb-10 grid grid-cols-1 items-stretch gap-x-6 gap-y-5 sm:gap-x-8 lg:mt-4 lg:mb-14 lg:grid-cols-5 lg:gap-x-10">
          <div className="h-full min-w-0 lg:col-span-2">
            <ModulePairPresetControl
              value={modulePairPreset}
              onChange={onModulePairPresetChange}
              className="h-full"
            />
          </div>

          <div className="grid h-full min-w-0 grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:col-span-3">
            <SpecsSelectorCard title={m.specs.longiSelect} className="h-full">
              <SearchableSelect
                value={selectedLongiId}
                onValueChange={onSelectLongi}
                placeholder={m.specs.selectPlaceholder}
                searchPlaceholder={m.specs.selectSearch}
                triggerClassName={SPECS_SELECTOR_TRIGGER_CLASS}
                options={longiModules.map((mod) => ({
                  value: mod.id,
                  label: moduleDisplayName(mod, locale),
                  keywords: `${mod.model} ${mod.powerWp} ${mod.manufacturer}`,
                }))}
              />
            </SpecsSelectorCard>
            <SpecsSelectorCard
              title={m.specs.competitorSelect}
              className="h-full"
            >
              <SearchableSelect
                value={selectedCompetitorId}
                onValueChange={onSelectCompetitor}
                placeholder={m.specs.selectPlaceholder}
                searchPlaceholder={m.specs.selectSearch}
                triggerClassName={SPECS_SELECTOR_TRIGGER_CLASS}
                options={competitorModules.map((mod) => ({
                  value: mod.id,
                  label: moduleDisplayName(mod, locale),
                  keywords: `${mod.model} ${mod.powerWp} ${mod.manufacturer}`,
                }))}
              />
            </SpecsSelectorCard>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-x-10 gap-y-6 lg:grid-cols-5 lg:gap-y-8 lg:pt-2">
          <div className="flex w-full min-w-0 flex-col gap-3 lg:col-span-2">
            <div className="relative aspect-[3/4] min-h-[420px] w-full rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden shadow-2xl">
              <div className="absolute inset-0">
                <Image
                  src={LONGI_PRODUCT_HERO_IMAGE}
                  alt="LR7-60HVD-540M"
                  width={1200}
                  height={900}
                  className="absolute right-0 top-0 h-full w-auto max-w-full object-contain object-right"
                  sizes="(max-width: 1024px) 40vw, 360px"
                  priority
                />
              </div>
            </div>
            <p className="text-sm font-bold text-slate-800 text-center px-2">
              {badgeName}
            </p>
          </div>

          <div className="w-full min-w-0 space-y-4 lg:col-span-3">
            {SPEC_FIELDS.map((field) => {
              const longiRaw = rawValueForField(longi, field);
              const compRaw = rawValueForField(competitor, field);
              const isPrice = field === "price";
              const longiDisplay = formatSpecDisplayValue(
                field,
                longiRaw,
                sym,
                specDisplayOpts
              );
              const compDisplay = formatSpecDisplayValue(
                field,
                compRaw,
                sym,
                specDisplayOpts
              );
              const longiPriceParts = isPrice
                ? formatPricePerWParts(
                    longiRaw,
                    longi.power,
                    sym,
                    m.common.perModuleUnit
                  )
                : undefined;
              const compPriceParts = isPrice
                ? formatPricePerWParts(
                    compRaw,
                    competitor.power,
                    sym,
                    m.common.perModuleUnit
                  )
                : undefined;
              const longiIsDefault =
                !longiRaw.trim() && isSpecFieldUsingDefault(field, longiRaw);
              const compIsDefault =
                !compRaw.trim() && isSpecFieldUsingDefault(field, compRaw);
              const advantage = longiSpecAdvantageVariant(
                field,
                longiRaw,
                compRaw
              );
              const longiColor = longiSpecValueColorClass(
                advantage,
                !!longiRaw.trim()
              );
              const longiManual = isOverridden("longi", field);
              const compManual = isOverridden("competitor", field);

              return (
                <button
                  key={field}
                  type="button"
                  onClick={() => setEditingField(field)}
                  className="w-full flex flex-col gap-3 max-lg:items-stretch lg:flex-row lg:items-center lg:justify-between lg:gap-4 p-7 bg-white rounded-2xl shadow-lg shadow-slate-200/50 hover:ring-2 hover:ring-[#E40011]/20 transition-all text-left group"
                >
                  <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
                    <span className="text-slate-500 font-medium">
                      {m.specParams[field]}
                    </span>
                    <Pencil className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    {(longiManual || compManual) && (
                      <span className="text-xs text-[#E40011] shrink-0">
                        {m.specs.manuallyAdjusted}
                      </span>
                    )}
                  </div>
                  <div
                    className={`min-w-0 flex-1 ${
                      isPrice
                        ? "grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_2rem_minmax(0,1fr)] items-center gap-x-3 gap-y-2 max-sm:justify-items-center max-sm:text-center"
                        : "grid grid-cols-[minmax(0,1fr)_2rem_minmax(0,1fr)] items-center gap-x-3"
                    }`}
                  >
                    <div className="min-w-0 max-sm:justify-self-center">
                      <SpecCompareValue
                        display={longiDisplay}
                        parts={longiPriceParts}
                        colorClass={longiColor}
                        isPrice={isPrice}
                        align="right"
                        showDefaultHint={longiIsDefault}
                      />
                    </div>
                    <span className="text-sm text-slate-400 text-center max-sm:py-0.5">
                      {m.common.vs}
                    </span>
                    <div className="min-w-0 max-sm:justify-self-center">
                      <SpecCompareValue
                        display={compDisplay}
                        parts={compPriceParts}
                        colorClass={
                          compRaw.trim() ? "text-slate-400" : "text-slate-300"
                        }
                        isPrice={isPrice}
                        align="left"
                        showDefaultHint={compIsDefault}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <SpecParamEditSheet
        open={editingField !== null}
        onOpenChange={(o) => !o && setEditingField(null)}
        field={editingField}
        longiValue={
          editingField
            ? rawValueForField(longi, editingField) ||
              rawValueForField(longiBase, editingField)
            : ""
        }
        competitorValue={
          editingField
            ? rawValueForField(competitor, editingField) ||
              rawValueForField(competitorBase, editingField)
            : ""
        }
        longiRecord={longiRecord}
        compRecord={compRecord}
        onApply={onApplyOverride}
        onReset={onResetOverride}
        onSaveToLibrary={onSaveToLibrary}
      />
    </motion.section>
  );
}
