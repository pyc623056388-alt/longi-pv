"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { AppLegalFooter } from "@/components/app-legal-footer";
import { useI18n } from "@/components/locale-provider";
import { StringCalculatorHero } from "@/components/string-calculator/string-calculator-hero";
import { StringCalculatorResults } from "@/components/string-calculator/string-calculator-results";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Button } from "@/components/ui/button";
import { useDataStore } from "@/hooks/use-data-store";
import {
  ASHRAE_METEO_HOME,
  ASHRAE_VERSIONS,
  DEFAULT_ASHRAE_VERSION,
  formatDistanceKm,
  parseCoordinates,
  type AshraeStation,
  type AshraeStationParams,
  type AshraeVersion,
} from "@/lib/ashrae-meteo";
import type { AppLocale } from "@/lib/i18n";
import { moduleDisplayName } from "@/lib/i18n/module-labels";
import {
  DEFAULT_VOLTAGE_LIMIT_V,
  alphaFromPercentPerC,
  alphaVocFromModule,
  calculateModuleString,
  calculateStringVoltage,
  formatAlphaPctDisplay,
  newCustomModuleId,
  type StringModuleInput,
} from "@/lib/string-calculator";
import {
  downloadBlob,
  stringCalcExportBasename,
  type StringCalcSnapshot,
} from "@/lib/string-calculator-snapshot";
import type { ModuleRecord } from "@/lib/pv-types";
import {
  groupPanRecordsByLibrary,
  recordFromPanContent,
} from "@/lib/string-calculator-pan-import";
import { cn } from "@/lib/utils";

const FIELD =
  "w-full px-5 py-3.5 bg-white/80 rounded-2xl shadow-lg shadow-slate-200/50 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E40011]/30";

interface DraftModule {
  id: string;
  libraryId: string;
  model: string;
  powerWp: string;
  vocStc: string;
  alphaPct: string;
  modulesPerString: string;
}

const PREFERRED_LIBRARY_MODELS = ["LR7-72HVD-650M", "LR8-66HVD-650M"];
const MAX_PAN_IMPORT_DRAFTS = 8;

function suggestedModulesPerString(
  rec: ModuleRecord,
  tEamdbtC: number,
  voltageLimitV: number
): string {
  if (rec.voc == null || rec.voc <= 0) return "26";
  const t = Number.isFinite(tEamdbtC) ? tEamdbtC : 0;
  const limit = voltageLimitV > 0 ? voltageLimitV : DEFAULT_VOLTAGE_LIMIT_V;
  const row = calculateModuleString(
    {
      id: rec.id,
      model: rec.model,
      powerWp: rec.powerWp,
      vocStc: rec.voc,
      alphaVocPerC: alphaVocFromModule(rec.vocTempCoefPct),
      modulesPerString: 1,
    },
    { tEamdbtC: t, voltageLimitV: limit }
  );
  return String(row.iec.maxModules || 26);
}

function draftFromRecord(
  rec: ModuleRecord,
  modulesPerString: string
): DraftModule {
  return {
    id: rec.id,
    libraryId: rec.id,
    model: rec.model,
    powerWp: String(rec.powerWp),
    vocStc: rec.voc != null ? String(rec.voc) : "",
    alphaPct: formatAlphaPctDisplay(rec.vocTempCoefPct),
    modulesPerString,
  };
}

function parseDrafts(drafts: DraftModule[]): StringModuleInput[] {
  return drafts
    .map((d) => {
      const vocStc = parseFloat(d.vocStc);
      const powerWp = parseFloat(d.powerWp);
      const alphaPct = parseFloat(d.alphaPct);
      const modulesPerString = parseInt(d.modulesPerString, 10);
      if (
        !d.model.trim() ||
        !Number.isFinite(vocStc) ||
        vocStc <= 0 ||
        !Number.isFinite(modulesPerString) ||
        modulesPerString <= 0 ||
        !Number.isFinite(alphaPct)
      ) {
        return null;
      }
      return {
        id: d.id,
        model: d.model.trim(),
        powerWp: Number.isFinite(powerWp) ? powerWp : 0,
        vocStc,
        alphaVocPerC: alphaFromPercentPerC(alphaPct),
        modulesPerString,
      } satisfies StringModuleInput;
    })
    .filter((m): m is StringModuleInput => m != null);
}

export function StringCalculatorPage({
  locale,
  onLocaleChange,
}: {
  locale: AppLocale;
  onLocaleChange: (locale: AppLocale) => void;
}) {
  const { m } = useI18n();
  const t = m.stringCalc;
  const { visibleLongiModules, visibleCompetitorModules, ready, bulkAddModules } =
    useDataStore();

  const [clientName, setClientName] = useState("Elecnor");
  const [projectName, setProjectName] = useState("Richmond Valley Solar Farm");
  const [location, setLocation] = useState("Myrtle Creek, NSW, Australia");
  const [coordinates, setCoordinates] = useState(
    "-29.098827, 153.047678"
  );
  const [ashraeVersion, setAshraeVersion] = useState<AshraeVersion>(
    DEFAULT_ASHRAE_VERSION
  );
  const [stations, setStations] = useState<AshraeStation[]>([]);
  const [selectedWmo, setSelectedWmo] = useState("");
  const [stationParams, setStationParams] = useState<AshraeStationParams | null>(
    null
  );
  const [tEamdbt, setTEamdbt] = useState("0.9");
  const [tminManual, setTminManual] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [voltageLimit, setVoltageLimit] = useState(String(DEFAULT_VOLTAGE_LIMIT_V));
  const [drafts, setDrafts] = useState<DraftModule[]>([]);
  const [exporting, setExporting] = useState<"xlsx" | "docx" | null>(null);
  const [importingPan, setImportingPan] = useState(false);
  const panInputRef = useRef<HTMLInputElement>(null);

  const libraryOptions = useMemo(() => {
    const toOpts = (mods: ModuleRecord[], group: string) =>
      mods
        .filter((mod) => mod.voc != null && mod.voc > 0)
        .map((mod) => ({
          value: mod.id,
          label: `${group} · ${moduleDisplayName(mod, locale)} · ${mod.powerWp}W`,
          keywords: `${mod.manufacturer} ${mod.model} ${mod.powerWp}`,
        }));
    return [
      { value: "", label: t.pickModulePlaceholder },
      ...toOpts(visibleLongiModules, t.libraryLongi),
      ...toOpts(visibleCompetitorModules, t.libraryCompetitor),
    ];
  }, [
    locale,
    t.libraryCompetitor,
    t.libraryLongi,
    t.pickModulePlaceholder,
    visibleCompetitorModules,
    visibleLongiModules,
  ]);

  const allLibrary = useMemo(
    () => [...visibleLongiModules, ...visibleCompetitorModules],
    [visibleCompetitorModules, visibleLongiModules]
  );

  useEffect(() => {
    if (!ready || drafts.length > 0) return;
    const withVoc = visibleLongiModules.filter((mod) => mod.voc && mod.voc > 0);
    const preferred = PREFERRED_LIBRARY_MODELS.map((model) =>
      withVoc.find((mod) => mod.model === model)
    ).filter((mod): mod is ModuleRecord => Boolean(mod));
    const picked = preferred.length >= 1 ? preferred : withVoc.slice(0, 2);
    if (picked.length === 0) return;
    const tmin = parseFloat(tEamdbt);
    const limit = parseFloat(voltageLimit);
    setDrafts(
      picked.map((mod) =>
        draftFromRecord(mod, suggestedModulesPerString(mod, tmin, limit))
      )
    );
  }, [drafts.length, ready, tEamdbt, visibleLongiModules, voltageLimit]);

  const tminNum = parseFloat(tEamdbt);
  const limitNum = parseFloat(voltageLimit);
  const modules = useMemo(() => parseDrafts(drafts), [drafts]);
  const canCalc = Number.isFinite(tminNum) && Number.isFinite(limitNum) && limitNum > 0;
  const result = useMemo(() => {
    if (!canCalc || modules.length === 0) return null;
    return calculateStringVoltage(modules, {
      tEamdbtC: tminNum,
      voltageLimitV: limitNum,
    });
  }, [canCalc, limitNum, modules, tminNum]);

  const selectedStation =
    stations.find((s) => s.wmo === selectedWmo) ?? stationParams?.station;

  const buildSnapshot = useCallback((): StringCalcSnapshot | null => {
    if (!result || !Number.isFinite(tminNum)) return null;
    return {
      generatedAtIso: new Date().toISOString(),
      project: {
        clientName: clientName.trim(),
        projectName: projectName.trim(),
        location: location.trim(),
        coordinates: coordinates.trim(),
      },
      weather: {
        stationName: selectedStation?.place ?? stationParams?.station.place ?? "",
        wmo: selectedStation?.wmo ?? stationParams?.station.wmo ?? "",
        distanceKm:
          selectedStation?.distanceKm ?? stationParams?.station.distanceKm ?? null,
        period: stationParams?.period ?? "",
        ashraeVersion,
        tEamdbtC: tminNum,
        tminManual,
        sourceUrl: ASHRAE_METEO_HOME,
      },
      voltageLimitV: limitNum,
      modules,
      result,
    };
  }, [
    ashraeVersion,
    clientName,
    coordinates,
    limitNum,
    location,
    modules,
    projectName,
    result,
    selectedStation,
    stationParams,
    tminManual,
    tminNum,
  ]);

  const applyStationParams = useCallback(async (station: AshraeStation) => {
    const qs = new URLSearchParams({
      wmo: station.wmo,
      version: ashraeVersion,
      lat: String(station.lat),
      lon: String(station.lon),
      distanceKm: String(station.distanceKm),
      place: station.place,
    });
    const res = await fetch(`/api/ashrae/params?${qs}`);
    const json = (await res.json()) as AshraeStationParams & { error?: string };
    if (!res.ok) throw new Error(json.error || t.stationsError);
    setStationParams(json);
    setSelectedWmo(json.station.wmo);
    setTEamdbt(String(json.extremeAnnualDbMeanMinC));
    setTminManual(false);
  }, [ashraeVersion, t.stationsError]);

  const handleFindStations = useCallback(async () => {
    const coords = parseCoordinates(coordinates);
    if (!coords) {
      toast.warning(t.needCoords);
      return;
    }
    setLookingUp(true);
    try {
      const qs = new URLSearchParams({
        lat: String(coords.lat),
        lon: String(coords.lon),
        version: ashraeVersion,
        number: "10",
      });
      const res = await fetch(`/api/ashrae/stations?${qs}`);
      const json = (await res.json()) as {
        stations?: AshraeStation[];
        error?: string;
      };
      if (!res.ok) throw new Error(json.error || t.stationsError);
      const list = json.stations ?? [];
      setStations(list);
      if (list.length === 0) {
        toast.warning(t.stationsEmpty);
        return;
      }
      await applyStationParams(list[0]!);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.stationsError);
    } finally {
      setLookingUp(false);
    }
  }, [applyStationParams, ashraeVersion, coordinates, t.needCoords, t.stationsEmpty, t.stationsError]);

  const handleSelectStation = useCallback(
    async (wmo: string) => {
      const station = stations.find((s) => s.wmo === wmo);
      if (!station) return;
      setLookingUp(true);
      try {
        await applyStationParams(station);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t.stationsError);
      } finally {
        setLookingUp(false);
      }
    },
    [applyStationParams, stations, t.stationsError]
  );

  const updateDraft = (id: string, patch: Partial<DraftModule>) => {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  const applyLibraryModule = (draftId: string, libraryId: string) => {
    if (!libraryId) {
      updateDraft(draftId, { libraryId: "" });
      return;
    }
    const rec = allLibrary.find((mod) => mod.id === libraryId);
    if (!rec) return;
    const tmin = parseFloat(tEamdbt);
    const limit = parseFloat(voltageLimit);
    updateDraft(draftId, {
      ...draftFromRecord(rec, suggestedModulesPerString(rec, tmin, limit)),
      id: draftId,
    });
  };

  const importPanFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((file) =>
      file.name.toLowerCase().endsWith(".pan")
    );
    if (!list.length) {
      toast.warning(t.noPanFiles);
      return;
    }
    setImportingPan(true);
    try {
      const imported: ModuleRecord[] = [];
      let fail = 0;
      let noVoc = 0;
      for (const file of list) {
        const record = recordFromPanContent(await file.text());
        if (!record) {
          fail += 1;
          continue;
        }
        imported.push(record);
        if (!(record.voc && record.voc > 0)) noVoc += 1;
      }
      const grouped = groupPanRecordsByLibrary(imported);
      if (grouped.longi.length) bulkAddModules("longi", grouped.longi);
      if (grouped.competitor.length) bulkAddModules("competitor", grouped.competitor);

      const usable = imported.filter((rec) => rec.voc != null && rec.voc > 0);
      if (usable.length) {
        const tmin = parseFloat(tEamdbt);
        const limit = parseFloat(voltageLimit);
        const shown = usable.slice(0, MAX_PAN_IMPORT_DRAFTS);
        setDrafts((prev) => {
          const next = [...prev];
          for (const rec of shown) {
            const draft = draftFromRecord(
              rec,
              suggestedModulesPerString(rec, tmin, limit)
            );
            const idx = next.findIndex(
              (d) => d.libraryId === rec.id || d.model === rec.model
            );
            if (idx >= 0) next[idx] = { ...draft, id: next[idx]!.id };
            else next.push(draft);
          }
          return next;
        });
      }
      toast.success(t.panImportDone(imported.length, fail));
      if (noVoc) toast.warning(t.panImportNoVoc(noVoc));
    } finally {
      setImportingPan(false);
    }
  };

  const handleExport = async (kind: "xlsx" | "docx") => {
    const snapshot = buildSnapshot();
    if (!snapshot) {
      toast.warning(t.needTmin);
      return;
    }
    setExporting(kind);
    try {
      const basename = stringCalcExportBasename(snapshot.project);
      if (kind === "xlsx") {
        const { buildStringCalcWorkbook } = await import(
          "@/lib/string-calculator-export-xlsx"
        );
        const blob = await buildStringCalcWorkbook(snapshot);
        downloadBlob(blob, `${basename}.xlsx`);
        toast.success(t.exportExcelDone);
      } else {
        const { buildStringCalcDocx } = await import(
          "@/lib/string-calculator-export-docx"
        );
        const blob = await buildStringCalcDocx(snapshot);
        downloadBlob(blob, `${basename}.docx`);
        toast.success(t.exportWordDone);
      }
    } catch {
      toast.error(t.exportFailed);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <StringCalculatorHero
        locale={locale}
        onLocaleChange={onLocaleChange}
        exporting={exporting}
        onExportExcel={() => void handleExport("xlsx")}
        onExportWord={() => void handleExport("docx")}
      />

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-b from-slate-50 to-white py-16 sm:py-20"
      >
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mb-8 text-center sm:mb-10">
            <span className="mb-3 inline-block rounded-full bg-[#E40011]/10 px-4 py-1.5 text-sm font-semibold text-[#E40011]">
              {t.stepBadge}
            </span>
            <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              {t.sectionProject} · {t.sectionWeather} · {t.sectionModules}
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/60">
                <h3 className="mb-4 text-lg font-bold text-slate-900">
                  {t.sectionProject}
                </h3>
                <div className="space-y-4">
                  <label className="block space-y-2 text-sm font-semibold text-slate-700">
                    {t.clientName}
                    <input
                      className={FIELD}
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </label>
                  <label className="block space-y-2 text-sm font-semibold text-slate-700">
                    {t.projectName}
                    <input
                      className={FIELD}
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </label>
                  <label className="block space-y-2 text-sm font-semibold text-slate-700">
                    {t.location}
                    <input
                      className={FIELD}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </label>
                  <label className="block space-y-2 text-sm font-semibold text-slate-700">
                    {t.coordinates}
                    <input
                      className={FIELD}
                      value={coordinates}
                      onChange={(e) => setCoordinates(e.target.value)}
                      placeholder={t.coordinatesHint}
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/60">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    {t.sectionWeather}
                  </h3>
                  <a
                    href={ASHRAE_METEO_HOME}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-[#E40011] underline-offset-2 hover:underline"
                  >
                    {t.ashraeLink}
                  </a>
                </div>
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <label className="block space-y-2 text-sm font-semibold text-slate-700">
                    {t.ashraeVersion}
                    <select
                      className={FIELD}
                      value={ashraeVersion}
                      onChange={(e) =>
                        setAshraeVersion(e.target.value as AshraeVersion)
                      }
                    >
                      {ASHRAE_VERSIONS.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={() => void handleFindStations()}
                      disabled={lookingUp}
                      className="h-[52px] w-full rounded-2xl bg-[#E40011] text-white hover:bg-[#c4000f]"
                    >
                      {lookingUp ? t.findingStations : t.findStations}
                    </Button>
                  </div>
                </div>
                {stations.length > 0 ? (
                  <label className="mb-4 block space-y-2 text-sm font-semibold text-slate-700">
                    {t.nearestStations}
                    <select
                      className={FIELD}
                      value={selectedWmo}
                      onChange={(e) => void handleSelectStation(e.target.value)}
                    >
                      {stations.map((s) => (
                        <option key={s.wmo} value={s.wmo}>
                          {s.place} · WMO {s.wmo} · {formatDistanceKm(s.distanceKm)}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
                {selectedStation ? (
                  <div className="mb-4 flex items-start gap-2 text-sm text-slate-500">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#E40011]" />
                    <span>
                      {selectedStation.place}
                      {selectedStation.wmo ? ` (WMO ${selectedStation.wmo})` : ""}
                      {` · ${formatDistanceKm(selectedStation.distanceKm)}`}
                      {stationParams?.period ? ` · ${stationParams.period}` : ""}
                    </span>
                  </div>
                ) : null}
                <label className="block space-y-2 text-sm font-semibold text-slate-700">
                  {t.tEamdbt} (°C)
                  <input
                    className={FIELD}
                    type="number"
                    step="0.1"
                    value={tEamdbt}
                    onChange={(e) => {
                      setTEamdbt(e.target.value);
                      setTminManual(true);
                    }}
                  />
                </label>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  {t.tEamdbtHint}
                  {tminManual ? ` · ${t.tminManual}` : null}
                </p>
              </section>

              <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/60">
                <h3 className="mb-4 text-lg font-bold text-slate-900">
                  {t.sectionString}
                </h3>
                <label className="block space-y-2 text-sm font-semibold text-slate-700">
                  {t.voltageLimit}
                  <input
                    className={FIELD}
                    type="number"
                    value={voltageLimit}
                    onChange={(e) => setVoltageLimit(e.target.value)}
                  />
                </label>
              </section>
            </div>

            <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/60">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {t.sectionModules}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">{t.panImportHint}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    disabled={importingPan}
                    onClick={() => panInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    {importingPan ? t.importingPan : t.importPan}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() =>
                      setDrafts((prev) => [
                        ...prev,
                        {
                          id: newCustomModuleId(),
                          libraryId: "",
                          model: "",
                          powerWp: "",
                          vocStc: "",
                          alphaPct: "-0.20",
                          modulesPerString: prev[0]?.modulesPerString || "29",
                        },
                      ])
                    }
                  >
                    <Plus className="h-4 w-4" />
                    {t.addModule}
                  </Button>
                </div>
              </div>
              <input
                ref={panInputRef}
                type="file"
                accept=".pan,.PAN"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) void importPanFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <div className="space-y-5">
                {drafts.map((draft, index) => (
                  <div
                    key={draft.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-500">
                        {t.customModule} {index + 1}
                      </span>
                      {drafts.length > 1 ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-[#E40011]"
                          onClick={() =>
                            setDrafts((prev) => prev.filter((d) => d.id !== draft.id))
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t.removeModule}
                        </button>
                      ) : null}
                    </div>
                    <label className="mb-3 block space-y-2 text-sm font-semibold text-slate-700">
                      {t.pickModule}
                      <SearchableSelect
                        value={draft.libraryId}
                        onValueChange={(id) => applyLibraryModule(draft.id, id)}
                        options={libraryOptions}
                        placeholder={t.pickModulePlaceholder}
                        triggerClassName={cn(FIELD, "h-auto border-0")}
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="col-span-2 space-y-2 text-sm font-semibold text-slate-700">
                        {t.model}
                        <input
                          className={FIELD}
                          value={draft.model}
                          onChange={(e) =>
                            updateDraft(draft.id, { model: e.target.value })
                          }
                        />
                      </label>
                      <label className="space-y-2 text-sm font-semibold text-slate-700">
                        {t.power}
                        <input
                          className={FIELD}
                          value={draft.powerWp}
                          onChange={(e) =>
                            updateDraft(draft.id, { powerWp: e.target.value })
                          }
                        />
                      </label>
                      <label className="space-y-2 text-sm font-semibold text-slate-700">
                        {t.voc}
                        <input
                          className={FIELD}
                          value={draft.vocStc}
                          onChange={(e) =>
                            updateDraft(draft.id, { vocStc: e.target.value })
                          }
                        />
                      </label>
                      <label className="space-y-2 text-sm font-semibold text-slate-700">
                        {t.alphaVoc}
                        <input
                          className={FIELD}
                          value={draft.alphaPct}
                          onChange={(e) =>
                            updateDraft(draft.id, { alphaPct: e.target.value })
                          }
                        />
                      </label>
                      <label className="space-y-2 text-sm font-semibold text-slate-700">
                        {t.modulesPerString}
                        <input
                          className={FIELD}
                          value={draft.modulesPerString}
                          onChange={(e) =>
                            updateDraft(draft.id, {
                              modulesPerString: e.target.value,
                            })
                          }
                        />
                      </label>
                    </div>
                    {(() => {
                      const rec = allLibrary.find((mod) => mod.id === draft.libraryId);
                      if (!rec) {
                        return (
                          <p className="mt-3 text-xs text-slate-400">{t.alphaVocDefault}</p>
                        );
                      }
                      const bits = [
                        rec.isc != null ? `${t.isc} ${rec.isc}` : null,
                        rec.vmp != null ? `${t.vmp} ${rec.vmp}` : null,
                        rec.imp != null ? `${t.imp} ${rec.imp}` : null,
                        rec.lengthMm && rec.widthMm
                          ? `${t.dimensions} ${rec.lengthMm}×${rec.widthMm} mm`
                          : null,
                      ].filter(Boolean);
                      return (
                        <p className="mt-3 text-xs leading-relaxed text-slate-500">
                          {t.fromLibrary}
                          {bits.length ? ` · ${t.electricalSpecs}: ${bits.join(" · ")}` : ""}
                          {rec.vocTempCoefPct != null
                            ? ` · αVoc ${rec.vocTempCoefPct.toFixed(2)} %/°C`
                            : ` · ${t.alphaVocDefault}`}
                        </p>
                      );
                    })()}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </motion.section>

      <section className="border-t border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mb-8 text-center">
            <span className="mb-3 inline-block rounded-full bg-[#E40011]/10 px-4 py-1.5 text-sm font-semibold text-[#E40011]">
              {t.resultsBadge}
            </span>
            <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              {t.resultsTitle}
            </h2>
            <p className="text-slate-500">{t.resultsSubtitle}</p>
          </div>
          {result ? (
            <StringCalculatorResults
              rows={result.rows}
              voltageLimitV={limitNum}
            />
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">
              {t.needTmin}
            </p>
          )}
        </div>
      </section>

      <AppLegalFooter />
    </div>
  );
}
