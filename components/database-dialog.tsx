"use client";

import type React from "react";
import { useRef, useState } from "react";
import { FolderOpen, Plus, Search, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useI18n } from "@/components/locale-provider";
import { generateId } from "@/lib/data-store";
import { libraryDefaults } from "@/lib/module-library-defaults";
import { moduleDisplayName } from "@/lib/i18n/module-labels";
import {
  formatModuleDimensions,
  moduleRecordNeedsCompletion,
} from "@/lib/module-utils";
import { parseEpwFile } from "@/lib/parsers/epw";
import {
  parsePanFile,
  validateModuleForStorage,
  validateModuleMinimal,
} from "@/lib/parsers/panfile";
import { parseSpreadsheetFile } from "@/lib/parsers/module-spreadsheet";
import {
  CURRENCY_SYMBOLS,
  type CurrencyCode,
  type ModuleLibrary,
  type ModuleRecord,
  type WeatherRecord,
} from "@/lib/pv-types";

interface DatabaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: CurrencyCode;
  longiModules: ModuleRecord[];
  competitorModules: ModuleRecord[];
  weatherList: WeatherRecord[];
  onUpsertModule: (library: ModuleLibrary, module: ModuleRecord) => void;
  onDeleteModule: (library: ModuleLibrary, id: string) => void;
  onBulkModules: (library: ModuleLibrary, modules: ModuleRecord[]) => void;
  onUpsertWeather: (record: WeatherRecord) => void;
  onDeleteWeather: (id: string) => void;
  onSyncBuiltinWeather: () => void;
  onSyncBuiltinModules: () => void;
}

const EMPTY_MODULE = (
  library: ModuleLibrary,
  competitorLabel: string
): ModuleRecord => {
  const d = libraryDefaults(library);
  return {
    id: generateId("mod"),
    manufacturer: library === "longi" ? "LONGi" : competitorLabel,
    model: "",
    powerWp: 0,
    pmpTempCoef: d.pmpTempCoef,
    firstYearDegradationPct: d.firstYearDegradationPct,
    annualDegradationPct: d.annualDegradationPct,
    pricePerW: d.pricePerW,
    library,
    source: "manual",
  };
};

function ModuleTable({
  modules,
  search,
  currency,
  onEdit,
  onDelete,
}: {
  modules: ModuleRecord[];
  search: string;
  currency: CurrencyCode;
  onEdit: (m: ModuleRecord) => void;
  onDelete: (id: string) => void;
}) {
  const { m: t, locale } = useI18n();
  const sym = CURRENCY_SYMBOLS[currency];
  const q = search.toLowerCase();
  const filtered = modules.filter(
    (mod) =>
      mod.model.toLowerCase().includes(q) ||
      mod.manufacturer.toLowerCase().includes(q)
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t.database.table.model}</TableHead>
          <TableHead>{t.database.table.power}</TableHead>
          <TableHead>{t.database.table.dimensions}</TableHead>
          <TableHead>{t.database.table.tempCoef}</TableHead>
          <TableHead>{t.database.table.deg}</TableHead>
          <TableHead>{t.database.table.price(currency)}</TableHead>
          <TableHead className="w-28">{t.common.actions}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((mod) => {
          const needsCompletion = moduleRecordNeedsCompletion(mod);
          return (
            <TableRow
              key={mod.id}
              className="cursor-pointer hover:bg-slate-50"
              onClick={() => onEdit(mod)}
            >
              <TableCell className="font-medium max-w-[240px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span>{moduleDisplayName(mod, locale)}</span>
                  {needsCompletion && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {t.common.pendingCompletion}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>{mod.powerWp} W</TableCell>
              <TableCell>{formatModuleDimensions(mod) ?? "—"}</TableCell>
              <TableCell>
                {mod.pmpTempCoef != null ? `${mod.pmpTempCoef} %/°C` : "—"}
              </TableCell>
              <TableCell>
                {mod.firstYearDegradationPct ?? "—"}% /{" "}
                {mod.annualDegradationPct ?? "—"}%
              </TableCell>
              <TableCell>
                {mod.pricePerW != null ? `${sym}${mod.pricePerW}` : "—"}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(mod)}
                  >
                    {t.common.edit}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600"
                    onClick={() => onDelete(mod.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
        {filtered.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-slate-500 py-8">
              {t.database.emptyTable}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function libraryLabel(
  library: ModuleLibrary,
  labels: { longi: string; competitor: string }
): string {
  return library === "longi" ? labels.longi : labels.competitor;
}

const DB_TAB_TRIGGER_CLASS =
  "rounded-md text-slate-500 font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:font-semibold data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-slate-200";

function EditorField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <Field orientation="vertical">
      <FieldLabel>{label}</FieldLabel>
      {hint ? <FieldDescription>{hint}</FieldDescription> : null}
      <FieldContent>{children}</FieldContent>
    </Field>
  );
}

function ModuleEditor({
  module,
  currency,
  onChange,
}: {
  module: ModuleRecord;
  currency: CurrencyCode;
  onChange: (m: ModuleRecord) => void;
}) {
  const { m } = useI18n();
  return (
    <FieldGroup>
      <FieldSet>
        <FieldLegend variant="legend" className="text-sm font-semibold">
          {m.database.editor.basicInfo}
        </FieldLegend>
        <div className="grid grid-cols-2 gap-x-5 gap-y-5">
          <EditorField label={m.database.editor.manufacturer}>
            <Input
              value={module.manufacturer}
              onChange={(e) =>
                onChange({ ...module, manufacturer: e.target.value })
              }
            />
          </EditorField>
          <EditorField label={m.database.editor.model}>
            <Input
              value={module.model}
              onChange={(e) => onChange({ ...module, model: e.target.value })}
            />
          </EditorField>
        </div>
      </FieldSet>

      <FieldSet>
        <FieldLegend variant="legend" className="text-sm font-semibold">
          {m.database.editor.powerAndSize}
        </FieldLegend>
        <div className="grid grid-cols-2 gap-x-5 gap-y-5">
          <EditorField label={m.database.editor.powerWp}>
            <Input
              type="number"
              value={module.powerWp || ""}
              onChange={(e) =>
                onChange({
                  ...module,
                  powerWp: parseFloat(e.target.value) || 0,
                })
              }
            />
          </EditorField>
          <EditorField label={m.database.editor.length}>
            <Input
              type="number"
              value={module.lengthMm ?? ""}
              onChange={(e) =>
                onChange({
                  ...module,
                  lengthMm: parseFloat(e.target.value) || undefined,
                })
              }
            />
          </EditorField>
          <EditorField label={m.database.editor.width}>
            <Input
              type="number"
              value={module.widthMm ?? ""}
              onChange={(e) =>
                onChange({
                  ...module,
                  widthMm: parseFloat(e.target.value) || undefined,
                })
              }
            />
          </EditorField>
        </div>
      </FieldSet>

      <FieldSet>
        <FieldLegend variant="legend" className="text-sm font-semibold">
          {m.database.editor.stcParams}
        </FieldLegend>
        <FieldDescription className="text-xs -mt-1 mb-1">
          {m.database.editor.stcHint}
        </FieldDescription>
        <div className="grid grid-cols-2 gap-x-5 gap-y-5">
          <EditorField label="Voc (V)">
            <Input
              type="number"
              step="0.01"
              value={module.voc ?? ""}
              onChange={(e) =>
                onChange({
                  ...module,
                  voc: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
            />
          </EditorField>
          <EditorField label="Isc (A)">
            <Input
              type="number"
              step="0.01"
              value={module.isc ?? ""}
              onChange={(e) =>
                onChange({
                  ...module,
                  isc: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
            />
          </EditorField>
          <EditorField label="Vmp (V)">
            <Input
              type="number"
              step="0.01"
              value={module.vmp ?? ""}
              onChange={(e) =>
                onChange({
                  ...module,
                  vmp: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
            />
          </EditorField>
          <EditorField label="Imp (A)">
            <Input
              type="number"
              step="0.01"
              value={module.imp ?? ""}
              onChange={(e) =>
                onChange({
                  ...module,
                  imp: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
            />
          </EditorField>
        </div>
      </FieldSet>

      <FieldSet>
        <FieldLegend variant="legend" className="text-sm font-semibold">
          {m.database.editor.electrical}
        </FieldLegend>
        <FieldDescription className="text-xs -mt-1 mb-1">
          {m.database.editor.electricalHint}
        </FieldDescription>
        <div className="grid grid-cols-2 gap-x-5 gap-y-5">
          <EditorField label={m.database.editor.pmpTempCoef}>
            <Input
              type="number"
              step="0.01"
              value={module.pmpTempCoef ?? ""}
              onChange={(e) =>
                onChange({
                  ...module,
                  pmpTempCoef: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
            />
          </EditorField>
          <EditorField label={m.database.editor.firstYearDeg}>
            <Input
              type="number"
              step="0.1"
              value={module.firstYearDegradationPct ?? ""}
              onChange={(e) =>
                onChange({
                  ...module,
                  firstYearDegradationPct: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
            />
          </EditorField>
          <EditorField label={m.database.editor.annualDeg}>
            <Input
              type="number"
              step="0.01"
              value={module.annualDegradationPct ?? ""}
              onChange={(e) =>
                onChange({
                  ...module,
                  annualDegradationPct: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
            />
          </EditorField>
        </div>
      </FieldSet>

      <FieldSet>
        <FieldLegend variant="legend" className="text-sm font-semibold">
          {m.database.editor.pricing}
        </FieldLegend>
        <div className="grid grid-cols-2 gap-x-5 gap-y-5">
          <EditorField label={m.database.editor.unitPrice(currency)}>
            <Input
              type="number"
              step="0.01"
              value={module.pricePerW ?? ""}
              onChange={(e) =>
                onChange({
                  ...module,
                  pricePerW: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
            />
          </EditorField>
        </div>
      </FieldSet>
    </FieldGroup>
  );
}

export function DatabaseDialog({
  open,
  onOpenChange,
  currency,
  longiModules,
  competitorModules,
  weatherList,
  onUpsertModule,
  onDeleteModule,
  onBulkModules,
  onUpsertWeather,
  onDeleteWeather,
  onSyncBuiltinWeather,
  onSyncBuiltinModules,
}: DatabaseDialogProps) {
  const { m } = useI18n();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ModuleRecord | null>(null);
  const panInputRef = useRef<HTMLInputElement>(null);
  const panFolderRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const epwInputRef = useRef<HTMLInputElement>(null);
  const [activeLib, setActiveLib] = useState<ModuleLibrary>("longi");

  const startEdit = (library: ModuleLibrary, mod?: ModuleRecord) => {
    setActiveLib(library);
    setEditing(mod ?? EMPTY_MODULE(library, m.database.defaultCompetitorName));
  };

  const saveModule = () => {
    if (!editing) return;
    const errors = validateModuleMinimal(editing);
    if (errors.length) {
      toast.error(errors.join("；"));
      return;
    }
    const fullErrors = validateModuleForStorage(editing);
    if (fullErrors.length) {
      toast.warning(
        m.database.saveIncomplete(
          fullErrors.filter((e) => !errors.includes(e)).join("、")
        )
      );
    }
    onUpsertModule(editing.library, editing);
    toast.success(m.database.moduleSaved);
    setEditing(null);
  };

  const importPanFiles = async (
    files: FileList | File[],
    library: ModuleLibrary
  ) => {
    const list = Array.from(files).filter((f) =>
      f.name.toLowerCase().endsWith(".pan")
    );
    if (!list.length) {
      toast.warning(m.database.noPanFiles);
      return;
    }
    let ok = 0;
    let fail = 0;
    const imported: ModuleRecord[] = [];
    for (const file of list) {
      const mod = await parsePanFile(file, library);
      if (mod) {
        const errs = validateModuleForStorage(mod);
        if (errs.length) {
          fail++;
          toast.warning(m.database.importIncomplete(file.name, errs.join("，")));
          imported.push(mod);
        } else {
          ok++;
          imported.push(mod);
        }
      } else fail++;
    }
    if (imported.length) onBulkModules(library, imported);
    toast.info(m.database.panImportDone(ok, fail));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-6xl max-w-[calc(100%-2rem)] max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{m.database.title}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-wrap gap-2 -mt-1 mb-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onSyncBuiltinModules();
                toast.success(m.database.syncModulesSuccess);
              }}
            >
              {m.database.syncModules}
            </Button>
          </div>

          <Tabs defaultValue="longi">
            <TabsList className="mb-1 grid h-11 w-full grid-cols-3 rounded-lg border border-slate-200 bg-slate-100 p-1">
              <TabsTrigger value="longi" className={DB_TAB_TRIGGER_CLASS}>
                {m.database.tabs.longi}
              </TabsTrigger>
              <TabsTrigger value="competitor" className={DB_TAB_TRIGGER_CLASS}>
                {m.database.tabs.competitor}
              </TabsTrigger>
              <TabsTrigger value="weather" className={DB_TAB_TRIGGER_CLASS}>
                {m.database.tabs.weather}
              </TabsTrigger>
            </TabsList>

            {(["longi", "competitor"] as ModuleLibrary[]).map((lib) => (
              <TabsContent key={lib} value={lib} className="space-y-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      className="pl-9"
                      placeholder={m.database.searchModules}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Button size="sm" onClick={() => startEdit(lib)}>
                    <Plus className="w-4 h-4 mr-1" />
                    {m.common.add}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setActiveLib(lib);
                      panInputRef.current?.click();
                    }}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    {m.database.importPan}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setActiveLib(lib);
                      panFolderRef.current?.click();
                    }}
                  >
                    <FolderOpen className="w-4 h-4 mr-1" />
                    {m.database.importPanFolder}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setActiveLib(lib);
                      csvInputRef.current?.click();
                    }}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    {m.database.importCsv}
                  </Button>
                </div>

                <ModuleTable
                  modules={lib === "longi" ? longiModules : competitorModules}
                  search={search}
                  currency={currency}
                  onEdit={(m) => startEdit(lib, m)}
                  onDelete={(id) => {
                    if (confirm(m.common.confirmDeleteModule)) {
                      onDeleteModule(lib, id);
                      toast.success(m.database.moduleDeleted);
                    }
                  }}
                />
              </TabsContent>
            ))}

            <TabsContent value="weather" className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onSyncBuiltinWeather();
                    toast.success(m.database.syncWeatherSuccess);
                  }}
                >
                  {m.database.syncWeather}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => epwInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-1" />
                  {m.database.importEpw}
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{m.database.table.name}</TableHead>
                    <TableHead>{m.database.table.location}</TableHead>
                    <TableHead>{m.database.table.yearlyHours}</TableHead>
                    <TableHead className="w-20">{m.common.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weatherList.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell>{w.name}</TableCell>
                      <TableCell>{w.location ?? "—"}</TableCell>
                      <TableCell>{w.yearlyEquivalentHours ?? "—"}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600"
                          onClick={() => {
                            if (confirm(m.common.confirmDelete)) {
                              onDeleteWeather(w.id);
                              toast.success(m.database.moduleDeleted);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>

          <input
            ref={panInputRef}
            type="file"
            accept=".pan"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) importPanFiles(e.target.files, activeLib);
              e.target.value = "";
            }}
          />
          <input
            ref={panFolderRef}
            type="file"
            {...({ webkitdirectory: "" } as React.InputHTMLAttributes<HTMLInputElement>)}
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) importPanFiles(e.target.files, activeLib);
              e.target.value = "";
            }}
          />
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,.tsv,.txt"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const mods = await parseSpreadsheetFile(file, activeLib);
              if (mods.length) {
                onBulkModules(activeLib, mods);
                toast.success(m.database.csvImported(mods.length));
              } else toast.error(m.database.csvParseFail);
              e.target.value = "";
            }}
          />
          <input
            ref={epwInputRef}
            type="file"
            accept=".epw"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const wx = await parseEpwFile(file);
              if (wx) {
                onUpsertWeather(wx);
                toast.success(m.database.epwImported(wx.name));
              } else toast.error(m.database.epwParseFail);
              e.target.value = "";
            }}
          />
        </DialogContent>
      </Dialog>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent
          side="right"
          className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-xl"
        >
          <SheetHeader className="shrink-0 space-y-2 border-b px-6 py-5 pr-12">
            <div className="flex flex-wrap items-center gap-2">
              <SheetTitle className="truncate text-lg">
                {editing?.model
                  ? m.database.editor.editModule(editing.model)
                  : m.database.editor.newModule}
              </SheetTitle>
              {editing && moduleRecordNeedsCompletion(editing) && (
                <Badge
                  variant="outline"
                  className="border-amber-200 bg-amber-50 text-amber-800"
                >
                  {m.common.pendingCompletion}
                </Badge>
              )}
            </div>
            {editing && (
              <SheetDescription>
                {editing.model
                  ? `${editing.manufacturer} · ${libraryLabel(editing.library, m.database.libraryLabel)}`
                  : m.database.editor.fillAndSave(
                      libraryLabel(editing.library, m.database.libraryLabel)
                    )}
              </SheetDescription>
            )}
          </SheetHeader>
          {editing && (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                <ModuleEditor
                  module={editing}
                  currency={currency}
                  onChange={setEditing}
                />
              </div>
              <SheetFooter className="shrink-0 flex-row justify-end gap-3 border-t bg-background px-6 py-4">
                <Button variant="outline" onClick={() => setEditing(null)}>
                  {m.common.cancel}
                </Button>
                <Button className="min-w-24" onClick={saveModule}>
                  {m.common.save}
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
