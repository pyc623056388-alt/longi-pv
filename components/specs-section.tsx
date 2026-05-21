"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Pencil } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SpecParamEditSheet } from "@/components/spec-param-edit-sheet";
import type { ModuleSpec } from "@/lib/pv-calculation";
import {
  formatSpecDisplayValue,
  isSpecFieldUsingDefault,
  moduleDisplayName,
  SPEC_PARAM_LABELS,
  type ModuleSpecField,
} from "@/lib/module-utils";
import type { CurrencyCode, ModuleRecord } from "@/lib/pv-types";
import { CURRENCY_SYMBOLS } from "@/lib/pv-types";

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
  currency,
  longiRecord,
  compRecord,
  onApplyOverride,
  onResetOverride,
  onSaveToLibrary,
}: SpecsSectionProps) {
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
    : "隆基组件";

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
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#E40011]/10 text-[#E40011] text-sm font-semibold mb-4">
            第二步
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            组件参数对比
          </h2>
          <p className="text-slate-500 mb-6">点击参数行可编辑；缺省字段将标注默认值</p>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <div className="text-left space-y-2">
              <label className="text-sm font-semibold text-slate-700">隆基组件</label>
              <Select value={selectedLongiId} onValueChange={onSelectLongi}>
                <SelectTrigger className="w-full h-12 rounded-xl">
                  <SelectValue placeholder="从组件库选择..." />
                </SelectTrigger>
                <SelectContent>
                  {longiModules.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {moduleDisplayName(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-left space-y-2">
              <label className="text-sm font-semibold text-slate-700">竞品组件</label>
              <Select
                value={selectedCompetitorId}
                onValueChange={onSelectCompetitor}
              >
                <SelectTrigger className="w-full h-12 rounded-xl">
                  <SelectValue placeholder="从组件库选择..." />
                </SelectTrigger>
                <SelectContent>
                  {competitorModules.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {moduleDisplayName(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10 items-start">
          <div className="lg:col-span-2">
            <div className="relative aspect-[3/4] min-h-[420px] rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden shadow-2xl">
              <div className="absolute inset-4 grid grid-cols-6 grid-rows-12 gap-0.5">
                {Array.from({ length: 72 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-sm"
                  />
                ))}
              </div>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
                <span className="text-sm font-bold text-white">{badgeName}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            {SPEC_FIELDS.map((field) => {
              const longiRaw = rawValueForField(longi, field);
              const compRaw = rawValueForField(competitor, field);
              const longiDisplay = formatSpecDisplayValue(field, longiRaw, sym);
              const compDisplay = formatSpecDisplayValue(field, compRaw, sym);
              const longiIsDefault =
                !longiRaw.trim() && isSpecFieldUsingDefault(field, longiRaw);
              const compIsDefault =
                !compRaw.trim() && isSpecFieldUsingDefault(field, compRaw);
              const highlight =
                field === "power" ||
                field === "tempCoef" ||
                field === "firstYearDeg";
              const longiManual = isOverridden("longi", field);
              const compManual = isOverridden("competitor", field);

              return (
                <button
                  key={field}
                  type="button"
                  onClick={() => setEditingField(field)}
                  className="w-full flex items-center justify-between p-7 bg-white rounded-2xl shadow-lg shadow-slate-200/50 hover:ring-2 hover:ring-[#E40011]/20 transition-all text-left group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">
                      {SPEC_PARAM_LABELS[field]}
                    </span>
                    <Pencil className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {(longiManual || compManual) && (
                      <span className="text-xs text-[#E40011]">已手动调整</span>
                    )}
                  </div>
                  <div className="flex items-center gap-8">
                    <span
                      className={`text-3xl font-extrabold ${
                        highlight
                          ? "bg-gradient-to-r from-[#E40011] to-[#ff4d5a] bg-clip-text text-transparent"
                          : longiRaw.trim()
                            ? "text-slate-900"
                            : "text-slate-400"
                      }`}
                    >
                      {longiDisplay}
                      {longiIsDefault && (
                        <span className="block text-xs font-normal text-slate-400">
                          默认值
                        </span>
                      )}
                    </span>
                    <span className="text-sm text-slate-400">vs</span>
                    <span
                      className={`text-2xl font-bold ${
                        compRaw.trim() ? "text-slate-400" : "text-slate-300"
                      }`}
                    >
                      {compDisplay}
                      {compIsDefault && (
                        <span className="block text-xs font-normal text-slate-400">
                          默认值
                        </span>
                      )}
                    </span>
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
