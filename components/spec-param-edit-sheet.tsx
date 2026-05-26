"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/components/locale-provider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ModuleSpec } from "@/lib/pv-calculation";
import type { ModuleSpecFieldKey } from "@/lib/i18n/types";
import { libraryDefaultSpecStrings } from "@/lib/module-library-defaults";
import type { ModuleLibrary, ModuleRecord } from "@/lib/pv-types";

type ModuleSpecField = ModuleSpecFieldKey;

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

function fieldPlaceholder(
  field: ModuleSpecField,
  library: ModuleLibrary
): string {
  const d = libraryDefaultSpecStrings(library);
  switch (field) {
    case "power":
      return library === "longi" ? "475" : "475";
    case "dimensions":
      return library === "longi" ? "1800×1134 mm" : "1762×1134 mm";
    case "tempCoef":
      return d.tempCoef;
    case "firstYearDeg":
      return d.firstYearDeg;
    case "annualDeg":
      return d.annualDeg;
    case "price":
      return d.price;
    default:
      return "";
  }
}

function fieldUnitHint(
  field: ModuleSpecField,
  m: ReturnType<typeof useI18n>["m"]
): string {
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
      return m.specs.fieldHints.dimensions;
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
  const { m } = useI18n();
  const [longiInput, setLongiInput] = useState("");
  const [compInput, setCompInput] = useState("");

  useEffect(() => {
    if (open && field) {
      setLongiInput(longiValue);
      setCompInput(competitorValue);
    }
  }, [open, field, longiValue, competitorValue]);

  if (!field) return null;

  const label = m.specParams[field];
  const hint = fieldUnitHint(field, m);

  const handleApply = () => {
    onApply(field, { longi: longiInput.trim(), competitor: compInput.trim() });
    onOpenChange(false);
    toast.success(m.specs.editSheet.appliedToast);
  };

  const handleReset = () => {
    onReset(field);
    onOpenChange(false);
    toast.info(m.specs.editSheet.resetToast);
  };

  const handleSaveToLibrary = () => {
    if (!longiRecord && !compRecord) {
      toast.error(m.specs.editSheet.noRecord);
      return;
    }
    const values = { longi: longiInput.trim(), competitor: compInput.trim() };
    if (!values.longi && !values.competitor) {
      toast.error(m.specs.editSheet.fillOneSide);
      return;
    }
    onSaveToLibrary(field, values);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md w-full">
        <SheetHeader>
          <SheetTitle>{m.specs.editSheet.title(label)}</SheetTitle>
          <SheetDescription>
            {m.specs.editSheet.description}
            {hint ? m.specs.editSheet.unit(hint) : ""}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>{m.specs.longiSelect}</Label>
            <Input
              value={longiInput}
              onChange={(e) => setLongiInput(e.target.value)}
              placeholder={fieldPlaceholder(field, "longi")}
            />
          </div>
          <div>
            <Label>{m.specs.competitorSelect}</Label>
            <Input
              value={compInput}
              onChange={(e) => setCompInput(e.target.value)}
              placeholder={fieldPlaceholder(field, "competitor")}
            />
          </div>
        </div>
        <SheetFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleApply} className="w-full">
            {m.specs.editSheet.apply}
          </Button>
          <Button variant="outline" onClick={handleReset} className="w-full">
            {m.specs.editSheet.reset}
          </Button>
          <Button variant="secondary" onClick={handleSaveToLibrary} className="w-full">
            {m.specs.editSheet.saveToLibrary}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
