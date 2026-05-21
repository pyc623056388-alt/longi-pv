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
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { generateId } from "@/lib/data-store";
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
}

const EMPTY_MODULE = (library: ModuleLibrary): ModuleRecord => ({
  id: generateId("mod"),
  manufacturer: library === "longi" ? "LONGi" : "竞品",
  model: "",
  powerWp: 0,
  pmpTempCoef: -0.29,
  firstYearDegradationPct: 1,
  annualDegradationPct: 0.4,
  library,
  source: "manual",
});

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
  const sym = CURRENCY_SYMBOLS[currency];
  const q = search.toLowerCase();
  const filtered = modules.filter(
    (m) =>
      m.model.toLowerCase().includes(q) ||
      m.manufacturer.toLowerCase().includes(q)
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>型号</TableHead>
          <TableHead>功率</TableHead>
          <TableHead>尺寸</TableHead>
          <TableHead>温度系数</TableHead>
          <TableHead>首年/年衰减</TableHead>
          <TableHead>单价 ({currency}/W)</TableHead>
          <TableHead className="w-28">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((m) => {
          const needsCompletion = moduleRecordNeedsCompletion(m);
          return (
            <TableRow
              key={m.id}
              className="cursor-pointer hover:bg-slate-50"
              onClick={() => onEdit(m)}
            >
              <TableCell className="font-medium max-w-[240px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span>
                    {m.manufacturer} {m.model}
                  </span>
                  {needsCompletion && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      待补全
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>{m.powerWp} W</TableCell>
              <TableCell>{formatModuleDimensions(m) ?? "—"}</TableCell>
              <TableCell>
                {m.pmpTempCoef != null ? `${m.pmpTempCoef} %/°C` : "—"}
              </TableCell>
              <TableCell>
                {m.firstYearDegradationPct ?? "—"}% /{" "}
                {m.annualDegradationPct ?? "—"}%
              </TableCell>
              <TableCell>
                {m.pricePerW != null ? `${sym}${m.pricePerW}` : "—"}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(m)}
                  >
                    编辑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600"
                    onClick={() => onDelete(m.id)}
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
              暂无数据，请导入或新增
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function ModuleEditor({
  module,
  currency,
  onChange,
  onSave,
  onCancel,
}: {
  module: ModuleRecord;
  currency: CurrencyCode;
  onChange: (m: ModuleRecord) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4 flex-1 overflow-y-auto px-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>制造商</Label>
          <Input
            value={module.manufacturer}
            onChange={(e) =>
              onChange({ ...module, manufacturer: e.target.value })
            }
          />
        </div>
        <div>
          <Label>型号</Label>
          <Input
            value={module.model}
            onChange={(e) => onChange({ ...module, model: e.target.value })}
          />
        </div>
        <div>
          <Label>功率 (Wp)</Label>
          <Input
            type="number"
            value={module.powerWp || ""}
            onChange={(e) =>
              onChange({ ...module, powerWp: parseFloat(e.target.value) || 0 })
            }
          />
        </div>
        <div>
          <Label>长度 (mm)</Label>
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
        </div>
        <div>
          <Label>宽度 (mm)</Label>
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
        </div>
        <div>
          <Label>
            Pmp 温度系数 (%/°C)
            <span className="text-xs text-slate-500 font-normal ml-1">
              Pan 可能缺失，可手动填写
            </span>
          </Label>
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
        </div>
        <div>
          <Label>
            首年衰减 (%)
            <span className="text-xs text-slate-500 font-normal ml-1">
              Pan 可能缺失，可手动填写
            </span>
          </Label>
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
        </div>
        <div>
          <Label>
            年衰减 (%)
            <span className="text-xs text-slate-500 font-normal ml-1">
              Pan 可能缺失，可手动填写
            </span>
          </Label>
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
        </div>
        <div>
          <Label>单价 ({currency}/W)</Label>
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
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2 border-t">
        <Button variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button onClick={onSave}>保存</Button>
      </div>
    </div>
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
}: DatabaseDialogProps) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ModuleRecord | null>(null);
  const panInputRef = useRef<HTMLInputElement>(null);
  const panFolderRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const epwInputRef = useRef<HTMLInputElement>(null);
  const [activeLib, setActiveLib] = useState<ModuleLibrary>("longi");

  const startEdit = (library: ModuleLibrary, m?: ModuleRecord) => {
    setActiveLib(library);
    setEditing(m ?? EMPTY_MODULE(library));
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
        `已保存，但尚缺：${fullErrors.filter((e) => !errors.includes(e)).join("、")}，对比测算将使用默认值直至补全`
      );
    }
    onUpsertModule(editing.library, editing);
    toast.success("组件已保存");
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
      toast.warning("未找到 .pan 文件");
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
          toast.warning(`${file.name}: ${errs.join("，")}（已导入，请编辑补全）`);
          imported.push(mod);
        } else {
          ok++;
          imported.push(mod);
        }
      } else fail++;
    }
    if (imported.length) onBulkModules(library, imported);
    toast.info(`Panfile 导入完成：成功 ${ok}，失败/需补全 ${fail}`);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-6xl max-w-[calc(100%-2rem)] max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>数据库管理</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="longi">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="longi">隆基组件库</TabsTrigger>
              <TabsTrigger value="competitor">竞品组件库</TabsTrigger>
              <TabsTrigger value="weather">天气文件</TabsTrigger>
            </TabsList>

            {(["longi", "competitor"] as ModuleLibrary[]).map((lib) => (
              <TabsContent key={lib} value={lib} className="space-y-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      className="pl-9"
                      placeholder="搜索型号或制造商..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Button size="sm" onClick={() => startEdit(lib)}>
                    <Plus className="w-4 h-4 mr-1" />
                    新增
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
                    导入 .pan
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
                    导入 Panfile 文件夹
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
                    导入 CSV
                  </Button>
                </div>

                <ModuleTable
                  modules={lib === "longi" ? longiModules : competitorModules}
                  search={search}
                  currency={currency}
                  onEdit={(m) => startEdit(lib, m)}
                  onDelete={(id) => {
                    if (confirm("确定删除该组件？")) {
                      onDeleteModule(lib, id);
                      toast.success("已删除");
                    }
                  }}
                />
              </TabsContent>
            ))}

            <TabsContent value="weather" className="space-y-4">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => epwInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-1" />
                  导入 EPW
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名称</TableHead>
                    <TableHead>地点</TableHead>
                    <TableHead>年等效小时</TableHead>
                    <TableHead className="w-20">操作</TableHead>
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
                            if (confirm("确定删除？")) {
                              onDeleteWeather(w.id);
                              toast.success("已删除");
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
                toast.success(`已导入 ${mods.length} 条组件`);
              } else toast.error("未能解析 CSV");
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
                toast.success(`已导入气象：${wx.name}`);
              } else toast.error("EPW 解析失败");
              e.target.value = "";
            }}
          />
        </DialogContent>
      </Dialog>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent side="right" className="sm:max-w-xl w-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editing?.model ? `编辑 ${editing.model}` : "新增组件"}
            </SheetTitle>
          </SheetHeader>
          {editing && (
            <ModuleEditor
              module={editing}
              currency={currency}
              onChange={setEditing}
              onSave={saveModule}
              onCancel={() => setEditing(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
