"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/components/locale-provider";
import {
  DEFAULT_MODULE_NEED_PREFERENCES,
  MODULE_NEED_IDS,
  MODULE_POWER_BANDS,
  powerBandFromWp,
  recommendLongiModule,
  type ModuleNeedId,
  type ModuleNeedPreferences,
  type ModulePowerBand,
} from "@/lib/module-recommend";
import type { ModuleRecord } from "@/lib/pv-types";
import { cn } from "@/lib/utils";

const FINDER_TRIGGER_CLASS = cn(
  "w-full h-11 rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-medium text-[#1A202C] shadow-none",
  "transition-[border-color,box-shadow,background-color] duration-200 ease-out",
  "hover:border-slate-300 hover:bg-[#FAFBFC]",
  "focus-visible:border-slate-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900/[0.08]"
);

interface ModuleVersionFinderProps {
  longiModules: ModuleRecord[];
  selectedLongiId: string;
  onSelectLongi: (id: string) => void;
  onApplied?: (info: {
    module: ModuleRecord;
    powerWp: ModulePowerBand;
    preferences: ModuleNeedPreferences;
  }) => void;
  className?: string;
}

export function ModuleVersionFinder({
  longiModules,
  selectedLongiId,
  onSelectLongi,
  onApplied,
  className,
}: ModuleVersionFinderProps) {
  const { m } = useI18n();
  const selected = longiModules.find((mod) => mod.id === selectedLongiId);
  const [powerWp, setPowerWp] = useState<ModulePowerBand>(() =>
    powerBandFromWp(selected?.powerWp ?? 650)
  );
  const [preferences, setPreferences] = useState<ModuleNeedPreferences>(
    DEFAULT_MODULE_NEED_PREFERENCES
  );

  const preview = useMemo(
    () =>
      recommendLongiModule(longiModules, {
        powerWp,
        preferences,
      }),
    [longiModules, powerWp, preferences]
  );

  const toggleNeed = (id: ModuleNeedId, checked: boolean) => {
    setPreferences((prev) => ({ ...prev, [id]: checked }));
  };

  const handleApply = () => {
    if (!preview.module) return;
    const payload = {
      module: preview.module,
      powerWp,
      preferences,
    };
    if (onApplied) {
      onApplied(payload);
      return;
    }
    onSelectLongi(preview.module.id);
  };

  const needLabels = m.specs.versionFinder.needs;

  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]",
        "transition-shadow duration-300 ease-out hover:shadow-[0_8px_28px_rgba(0,0,0,0.07)]",
        className
      )}
    >
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E40011]/10">
          <Sparkles className="h-4 w-4 text-[#E40011]" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[#1A202C]">
            {m.specs.versionFinder.title}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {m.specs.versionFinder.subtitle}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <Label className="mb-2 block text-xs font-medium tracking-wide text-[#4A5568]">
          {m.specs.versionFinder.powerBand}
        </Label>
        <Select
          value={String(powerWp)}
          onValueChange={(v) => setPowerWp(Number(v) as ModulePowerBand)}
        >
          <SelectTrigger className={FINDER_TRIGGER_CLASS}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODULE_POWER_BANDS.map((band) => (
              <SelectItem key={band} value={String(band)}>
                {m.specs.versionFinder.powerBandOptions[band]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <fieldset className="mb-4 space-y-2.5">
        <legend className="mb-2 text-xs font-medium tracking-wide text-[#4A5568]">
          {m.specs.versionFinder.needsLegend}
        </legend>
        {MODULE_NEED_IDS.map((id) => (
          <label
            key={id}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border border-transparent px-2 py-2",
              "transition-colors duration-150 hover:bg-slate-50",
              preferences[id] && "border-slate-200 bg-slate-50/80"
            )}
          >
            <Checkbox
              checked={Boolean(preferences[id])}
              onCheckedChange={(v) => toggleNeed(id, v === true)}
              className="mt-0.5 border-slate-300 data-[state=checked]:border-[#E40011] data-[state=checked]:bg-[#E40011]"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-[#1A202C]">
                {needLabels[id].label}
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-slate-500">
                {needLabels[id].hint}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="mb-4 rounded-xl bg-slate-50 px-3.5 py-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {m.specs.versionFinder.previewLabel}
        </p>
        <p className="mt-1 text-sm font-semibold tabular-nums text-[#1A202C]">
          {preview.module
            ? preview.module.model
            : m.specs.versionFinder.previewEmpty}
        </p>
        {preview.module && preview.reason === "partial" && (
          <p className="mt-1 text-xs text-amber-700">
            {m.specs.versionFinder.partialMatch}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleApply}
        disabled={!preview.module}
        className={cn(
          "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl",
          "bg-[#E40011] text-sm font-semibold text-white",
          "transition-[transform,background-color,opacity] duration-200",
          "hover:bg-[#C4000F] active:scale-[0.99]",
          "disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100"
        )}
      >
        <Sparkles className="h-4 w-4" strokeWidth={1.75} />
        {m.specs.versionFinder.apply}
      </button>
    </div>
  );
}
