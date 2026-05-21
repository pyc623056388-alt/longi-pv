"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ModuleSpec } from "@/lib/pv-calculation";
import {
  applySpecFieldToRecord,
  SPEC_PARAM_LABELS,
  type ModuleSpecField,
} from "@/lib/module-utils";
import { validateModuleForStorage } from "@/lib/parsers/panfile";
import type { ModuleRecord } from "@/lib/pv-types";

interface SpecParamEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: ModuleSpecField | null;
  longiValue: string;
  competitorValue: string;
  longiRecord?: ModuleRecord;
  compRecord?: ModuleRecord;
  onApply: (field: ModuleSpecField, values: { longi: string; competitor: string }) => void;
  onReset: (field: ModuleSpecField) => void;
  onSaveToLibrary: (
    field: ModuleSpecField,
    values: { longi: string; competitor: string }
  ) => void;
}

function fieldPlaceholder(field: ModuleSpecField): string {
  switch (field) {
    case "power":
      return "590";
    case "dimensions":
      return "2278×1134 mm";
    case "tempCoef":
      return "-0.29";
    case "firstYearDeg":
      return "1";
    case "annualDeg":
      return "0.4";
    case "price":
      return "0.95";
    default:
      return "";
  }
}

function fieldUnitHint(field: ModuleSpecField): string {
  switch (field) {
    case "power":
      return "W";
    case "tempCoef":
      return "%/°C";
    case "firstYearDeg":
    case "annualDeg":
      return "%";
    case "price":
      return "/W";
    case "dimensions":
      return "长×宽 mm，如 2278×1134";
    default:
      return "";
  }
}

export function SpecParamEditSheet({
  open,
  onOpenChange,
  field,
  longiValue,
  competitorValue,
  longiRecord,
  compRecord,
  onApply,
  onReset,
  onSaveToLibrary,
}: SpecParamEditSheetProps) {
  const [longiInput, setLongiInput] = useState("");
  const [compInput, setCompInput] = useState("");

  useEffect(() => {
    if (open && field) {
      setLongiInput(longiValue);
      setCompInput(competitorValue);
    }
  }, [open, field, longiValue, competitorValue]);

  if (!field) return null;

  const label = SPEC_PARAM_LABELS[field];
  const hint = fieldUnitHint(field);

  const handleApply = () => {
    onApply(field, { longi: longiInput.trim(), competitor: compInput.trim() });
    onOpenChange(false);
    toast.success("已应用本次对比参数");
  };

  const handleReset = () => {
    onReset(field);
    onOpenChange(false);
    toast.info("已恢复为组件库数值");
  };

  const handleSaveToLibrary = () => {
    if (!longiRecord && !compRecord) {
      toast.error("无可用组件记录");
      return;
    }
    const values = { longi: longiInput.trim(), competitor: compInput.trim() };
    if (longiRecord && values.longi) {
      const updated = applySpecFieldToRecord(longiRecord, field, values.longi);
      const errs = validateModuleForStorage(updated);
      if (errs.length) {
        toast.error(`隆基：${errs.join("；")}`);
        return;
      }
    }
    if (compRecord && values.competitor) {
      const updated = applySpecFieldToRecord(compRecord, field, values.competitor);
      const errs = validateModuleForStorage(updated);
      if (errs.length) {
        toast.error(`竞品：${errs.join("；")}`);
        return;
      }
    }
    onSaveToLibrary(field, values);
    onOpenChange(false);
    toast.success("已保存到组件库");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md w-full">
        <SheetHeader>
          <SheetTitle>编辑 {label}</SheetTitle>
          <SheetDescription>
            修改仅影响本次对比会话；也可选择写回组件库永久保存。
            {hint ? ` 单位：${hint}` : ""}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>隆基组件</Label>
            <Input
              value={longiInput}
              onChange={(e) => setLongiInput(e.target.value)}
              placeholder={fieldPlaceholder(field)}
            />
          </div>
          <div>
            <Label>竞品组件</Label>
            <Input
              value={compInput}
              onChange={(e) => setCompInput(e.target.value)}
              placeholder={fieldPlaceholder(field)}
            />
          </div>
        </div>
        <SheetFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleApply} className="w-full">
            应用（本次对比）
          </Button>
          <Button variant="outline" onClick={handleReset} className="w-full">
            恢复组件库数值
          </Button>
          <Button variant="secondary" onClick={handleSaveToLibrary} className="w-full">
            保存到组件库
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
