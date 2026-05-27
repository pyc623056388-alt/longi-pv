"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getMessages, type AppLocale } from "@/lib/i18n";
import { LocaleProvider } from "@/components/locale-provider";
import { HeroCover } from "@/components/hero-cover";
import { SetupSection } from "@/components/setup-section";
import { SpecsSection } from "@/components/specs-section";
import { ResultsSection } from "@/components/results-section";
import { AppLegalFooter } from "@/components/app-legal-footer";
import { DatabaseDialog } from "@/components/database-dialog";
import { useDataStore } from "@/hooks/use-data-store";
import { calculatePvComparison } from "@/lib/pv-calculation";
import { buildReportSnapshot } from "@/lib/report-snapshot";
import type { ModuleSpec } from "@/lib/pv-calculation";
import {
  applySpecFieldToRecord,
  mergeModuleSpec,
  moduleRecordToSpec,
  moduleSpecForCalculation,
  type ModuleSpecField,
} from "@/lib/module-utils";
import {
  prepareModuleForPersist,
  recordWithAllOverrides,
} from "@/lib/module-persist";
import { getDefaultWeatherId, getWeatherById } from "@/lib/data-store";
import {
  applyModulePairPreset,
  findActiveQuickPreset,
  isModulePairPresetId,
  type ModulePairPresetId,
  type QuickModulePairPresetId,
} from "@/lib/module-pair-presets";
import {
  buildSessionSnapshot,
  clearSession,
  loadSession,
  saveSession,
  type SpecOverridesSnapshot,
} from "@/lib/session-store";
import {
  convertBasicParams,
  convertMoney,
  convertPriceOverrideValue,
} from "@/lib/currency";
import {
  CURRENCY_LABELS,
  DEFAULT_BASIC_PARAMS,
  DEFAULT_GAIN_STRATEGIES,
  type CurrencyCode,
  type ModuleRecord,
} from "@/lib/pv-types";

const LOCALE_STORAGE_KEY = "longi-pv:locale";

export type SpecOverridesState = SpecOverridesSnapshot;

const FALLBACK_LONGI = {
  id: "fallback-l",
  manufacturer: "LONGi",
  model: "Hi-MO 7",
  powerWp: 590,
  lengthMm: 2278,
  widthMm: 1134,
  pmpTempCoef: -0.26,
  firstYearDegradationPct: 0.8,
  annualDegradationPct: 0.35,
  pricePerW: 0.25,
  library: "longi" as const,
};

const FALLBACK_COMP = {
  id: "fallback-c",
  manufacturer: "Competitor",
  model: "TOPCon",
  powerWp: 580,
  lengthMm: 2278,
  widthMm: 1134,
  pmpTempCoef: -0.29,
  firstYearDegradationPct: 1,
  annualDegradationPct: 0.4,
  pricePerW: 0.23,
  library: "competitor" as const,
};

export default function ModuleComparisonPage() {
  const [dbOpen, setDbOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [selectedWeather, setSelectedWeather] = useState("");
  const [comparisonMode, setComparisonMode] = useState<
    "sameCount" | "fixedCapacity"
  >("sameCount");
  const [moduleCount, setModuleCount] = useState("10000");
  const [basicParams, setBasicParams] = useState(DEFAULT_BASIC_PARAMS);
  const [hoursManualOverride, setHoursManualOverride] = useState(false);
  const [gainStrategies, setGainStrategies] = useState(DEFAULT_GAIN_STRATEGIES);
  const [specOverrides, setSpecOverrides] = useState<SpecOverridesState>({
    longi: {},
    competitor: {},
  });
  const [locale, setLocale] = useState<AppLocale>("zh");
  const [modulePairPreset, setModulePairPreset] =
    useState<ModulePairPresetId>("custom");
  const [sessionHydrated, setSessionHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored === "zh" || stored === "en") setLocale(stored);
    } catch {
      /* ignore */
    }
    const saved = loadSession();
    if (saved) {
      setProjectName(saved.projectName);
      setSelectedWeather(saved.selectedWeather);
      setComparisonMode(saved.comparisonMode);
      setModuleCount(saved.moduleCount);
      setBasicParams(saved.basicParams);
      setGainStrategies(saved.gainStrategies);
      setHoursManualOverride(saved.hoursManualOverride);
      setSpecOverrides(saved.specOverrides);
      setSelectedLongiId(saved.selectedLongiId);
      setSelectedCompetitorId(saved.selectedCompetitorId);
      setModulePairPreset(saved.modulePairPreset);
    }
    setSessionHydrated(true);
  }, []);

  const handleLocaleChange = useCallback((next: AppLocale) => {
    setLocale(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const {
    longiModules,
    competitorModules,
    visibleLongiModules,
    visibleCompetitorModules,
    weatherList,
    upsertModule,
    removeModule,
    bulkAddModules,
    upsertWeather,
    removeWeather,
    syncBuiltinWeather,
    syncBuiltinModules,
  } = useDataStore();

  const [selectedLongiId, setSelectedLongiId] = useState(
    () => longiModules[0]?.id ?? ""
  );
  const [selectedCompetitorId, setSelectedCompetitorId] = useState(
    () => competitorModules[0]?.id ?? ""
  );

  useEffect(() => {
    if (longiModules.length && !longiModules.some((m) => m.id === selectedLongiId)) {
      setSelectedLongiId(longiModules[0].id);
    }
  }, [longiModules, selectedLongiId]);

  useEffect(() => {
    if (
      visibleCompetitorModules.length &&
      !visibleCompetitorModules.some((m) => m.id === selectedCompetitorId)
    ) {
      setSelectedCompetitorId(visibleCompetitorModules[0].id);
    }
  }, [visibleCompetitorModules, selectedCompetitorId]);

  useEffect(() => {
    if (!sessionHydrated || selectedWeather) return;
    const defaultId = getDefaultWeatherId();
    if (defaultId && weatherList.some((w) => w.id === defaultId)) {
      setSelectedWeather(defaultId);
    } else if (weatherList[0]) {
      setSelectedWeather(weatherList[0].id);
    }
  }, [sessionHydrated, selectedWeather, weatherList]);

  useEffect(() => {
    if (!sessionHydrated) return;
    const timer = window.setTimeout(() => {
      saveSession(
        buildSessionSnapshot({
          projectName,
          selectedWeather,
          comparisonMode,
          moduleCount,
          basicParams,
          gainStrategies,
          hoursManualOverride,
          specOverrides,
          selectedLongiId,
          selectedCompetitorId,
          modulePairPreset,
        })
      );
    }, 300);
    return () => window.clearTimeout(timer);
  }, [
    sessionHydrated,
    projectName,
    selectedWeather,
    comparisonMode,
    moduleCount,
    basicParams,
    gainStrategies,
    hoursManualOverride,
    specOverrides,
    selectedLongiId,
    selectedCompetitorId,
    modulePairPreset,
  ]);

  const effectiveLongiId =
    selectedLongiId && longiModules.some((m) => m.id === selectedLongiId)
      ? selectedLongiId
      : longiModules[0]?.id ?? "";
  const effectiveCompId =
    selectedCompetitorId &&
    competitorModules.some((m) => m.id === selectedCompetitorId)
      ? selectedCompetitorId
      : visibleCompetitorModules[0]?.id ?? competitorModules[0]?.id ?? "";

  const syncModulePairPresetFromSelection = useCallback(
    (longiId: string, compId: string) => {
      const active = findActiveQuickPreset(
        longiId,
        compId,
        longiModules,
        competitorModules
      );
      setModulePairPreset(active ?? "custom");
    },
    [longiModules, competitorModules]
  );

  const handleModulePairPresetChange = useCallback(
    (next: ModulePairPresetId) => {
      setModulePairPreset(next);
      if (next === "custom") return;

      const msgs = getMessages(locale).specs;
      const { longiId, competitorId, warnings } = applyModulePairPreset(
        next as QuickModulePairPresetId,
        longiModules,
        competitorModules,
        {
          hvhFallback: msgs.presetHvhFallback,
          missingPair: msgs.presetMissingPair,
        }
      );
      if (longiId) setSelectedLongiId(longiId);
      if (competitorId) setSelectedCompetitorId(competitorId);
      for (const w of warnings) toast.warning(w);
    },
    [longiModules, competitorModules, locale]
  );

  const handleSelectLongi = useCallback(
    (id: string) => {
      setSelectedLongiId(id);
      syncModulePairPresetFromSelection(id, effectiveCompId);
    },
    [effectiveCompId, syncModulePairPresetFromSelection]
  );

  const handleSelectCompetitor = useCallback(
    (id: string) => {
      setSelectedCompetitorId(id);
      syncModulePairPresetFromSelection(effectiveLongiId, id);
    },
    [effectiveLongiId, syncModulePairPresetFromSelection]
  );

  const longiRecord = longiModules.find((m) => m.id === effectiveLongiId);
  const compRecord = competitorModules.find((m) => m.id === effectiveCompId);

  const longiBaseSpec = useMemo(
    () =>
      moduleRecordToSpec(
        longiRecord ?? { ...FALLBACK_LONGI, source: "manual" as const }
      ),
    [longiRecord]
  );

  const competitorBaseSpec = useMemo(
    () =>
      moduleRecordToSpec(
        compRecord ?? { ...FALLBACK_COMP, source: "manual" as const }
      ),
    [compRecord]
  );

  const longiDisplaySpec = useMemo(
    () =>
      mergeModuleSpec(
        longiBaseSpec,
        specOverrides.longi[effectiveLongiId]
      ),
    [longiBaseSpec, specOverrides.longi, effectiveLongiId]
  );

  const competitorDisplaySpec = useMemo(
    () =>
      mergeModuleSpec(
        competitorBaseSpec,
        specOverrides.competitor[effectiveCompId]
      ),
    [competitorBaseSpec, specOverrides.competitor, effectiveCompId]
  );

  const longiCalcSpec = useMemo(
    () => moduleSpecForCalculation(longiDisplaySpec, "longi"),
    [longiDisplaySpec]
  );

  const competitorCalcSpec = useMemo(
    () => moduleSpecForCalculation(competitorDisplaySpec, "competitor"),
    [competitorDisplaySpec]
  );

  const overriddenFields = useMemo(() => {
    const longiOv = specOverrides.longi[effectiveLongiId] ?? {};
    const compOv = specOverrides.competitor[effectiveCompId] ?? {};
    return {
      longi: Object.keys(longiOv) as ModuleSpecField[],
      competitor: Object.keys(compOv) as ModuleSpecField[],
    };
  }, [specOverrides, effectiveLongiId, effectiveCompId]);

  const applyFieldOverride = useCallback(
    (field: ModuleSpecField, values: { longi: string; competitor: string }) => {
      setSpecOverrides((prev) => ({
        longi: {
          ...prev.longi,
          [effectiveLongiId]: {
            ...prev.longi[effectiveLongiId],
            [field]: values.longi,
          },
        },
        competitor: {
          ...prev.competitor,
          [effectiveCompId]: {
            ...prev.competitor[effectiveCompId],
            [field]: values.competitor,
          },
        },
      }));
    },
    [effectiveLongiId, effectiveCompId]
  );

  const resetFieldOverride = useCallback(
    (field: ModuleSpecField) => {
      setSpecOverrides((prev) => {
        const nextLongi = { ...prev.longi[effectiveLongiId] };
        const nextComp = { ...prev.competitor[effectiveCompId] };
        delete nextLongi[field];
        delete nextComp[field];
        const longiBucket = { ...prev.longi };
        const compBucket = { ...prev.competitor };
        if (Object.keys(nextLongi).length) {
          longiBucket[effectiveLongiId] = nextLongi;
        } else {
          delete longiBucket[effectiveLongiId];
        }
        if (Object.keys(nextComp).length) {
          compBucket[effectiveCompId] = nextComp;
        } else {
          delete compBucket[effectiveCompId];
        }
        return { longi: longiBucket, competitor: compBucket };
      });
    },
    [effectiveLongiId, effectiveCompId]
  );

  const convertSpecOverridesForCurrency = useCallback(
    (
      overrides: SpecOverridesState,
      from: CurrencyCode,
      to: CurrencyCode
    ): SpecOverridesState => {
      const mapBucket = (bucket: Record<string, Partial<ModuleSpec>>) => {
        const next: Record<string, Partial<ModuleSpec>> = {};
        for (const [id, partial] of Object.entries(bucket)) {
          if (partial.price === undefined) {
            next[id] = partial;
            continue;
          }
          next[id] = {
            ...partial,
            price: convertPriceOverrideValue(partial.price, from, to),
          };
        }
        return next;
      };
      return {
        longi: mapBucket(overrides.longi),
        competitor: mapBucket(overrides.competitor),
      };
    },
    []
  );

  const handleCurrencyChange = useCallback(
    (next: CurrencyCode) => {
      const from = basicParams.currency;
      if (from === next) return;

      setBasicParams((prev) => convertBasicParams(prev, next));

      const convertModule = (m: ModuleRecord) => {
        if (m.pricePerW == null) return m;
        return {
          ...m,
          pricePerW: convertMoney(m.pricePerW, from, next, "pricePerW"),
        };
      };

      for (const m of longiModules) {
        if (m.pricePerW != null) {
          upsertModule("longi", convertModule(m));
        }
      }
      for (const m of competitorModules) {
        if (m.pricePerW != null) {
          upsertModule("competitor", convertModule(m));
        }
      }

      setSpecOverrides((prev) =>
        convertSpecOverridesForCurrency(prev, from, next)
      );

      toast.success(
        getMessages(locale).toast.currencySwitched(CURRENCY_LABELS[next])
      );
    },
    [
      basicParams.currency,
      longiModules,
      competitorModules,
      upsertModule,
      convertSpecOverridesForCurrency,
      locale,
    ]
  );

  const persistSideToLibrary = useCallback(
    (
      record: ModuleRecord,
      library: "longi" | "competitor",
      label: string,
      overrides: Partial<ModuleSpec> | undefined,
      field: ModuleSpecField,
      value: string
    ): boolean => {
      let updated = recordWithAllOverrides(record, overrides);
      if (value.trim()) {
        updated = applySpecFieldToRecord(updated, field, value);
      }
      const result = prepareModuleForPersist(updated);
      if (!result.ok) {
        const msgs = getMessages(locale);
        toast.error(msgs.toast.saveFailed(label, result.errors.join("；")));
        return false;
      }
      upsertModule(library, result.record);
      if (result.warnings.length) {
        const msgs = getMessages(locale);
        toast.warning(
          msgs.toast.saveWarning(label, result.warnings.join("、"))
        );
      }
      return true;
    },
    [upsertModule, locale]
  );

  const saveFieldToLibrary = useCallback(
    (field: ModuleSpecField, values: { longi: string; competitor: string }) => {
      const longiTrim = values.longi.trim();
      const compTrim = values.competitor.trim();
      if (!longiTrim && !compTrim) {
        toast.error(getMessages(locale).toast.fillOneSide);
        return;
      }
      const msgs = getMessages(locale);
      let saved = false;
      if (longiRecord && longiTrim) {
        saved =
          persistSideToLibrary(
            longiRecord,
            "longi",
            msgs.common.longi,
            specOverrides.longi[effectiveLongiId],
            field,
            longiTrim
          ) || saved;
      }
      if (compRecord && compTrim) {
        saved =
          persistSideToLibrary(
            compRecord,
            "competitor",
            msgs.common.competitor,
            specOverrides.competitor[effectiveCompId],
            field,
            compTrim
          ) || saved;
      }
      if (!saved) return;
      resetFieldOverride(field);
      toast.success(getMessages(locale).toast.savedToLibrary);
    },
    [
      longiRecord,
      compRecord,
      specOverrides,
      effectiveLongiId,
      effectiveCompId,
      persistSideToLibrary,
      resetFieldOverride,
      locale,
    ]
  );

  const epcHelper = useMemo(() => {
    const count = Math.max(1, parseInt(moduleCount, 10) || 1);
    const power = parseFloat(longiCalcSpec.power) || 590;
    const price = parseFloat(longiCalcSpec.price) || 0.25;
    return {
      moduleCount: count,
      longiPowerWp: power,
      longiPricePerW: price,
    };
  }, [moduleCount, longiCalcSpec.power, longiCalcSpec.price]);

  const results = useMemo(
    () =>
      calculatePvComparison({
        moduleCount: Math.max(1, parseInt(moduleCount, 10) || 1),
        mode: comparisonMode,
        longi: longiCalcSpec,
        competitor: competitorCalcSpec,
        basicParams,
        gainStrategies,
        locale,
      }),
    [
      moduleCount,
      comparisonMode,
      longiCalcSpec,
      competitorCalcSpec,
      basicParams,
      gainStrategies,
      locale,
    ]
  );

  const getReportSnapshot = useCallback(
    () =>
      buildReportSnapshot({
        projectName,
        weather:
          weatherList.find((w) => w.id === selectedWeather) ??
          (selectedWeather ? getWeatherById(selectedWeather) : undefined),
        comparisonMode,
        moduleCount,
        basicParams,
        gainStrategies,
        longi: longiCalcSpec,
        competitor: competitorCalcSpec,
        longiRecord,
        compRecord,
        results,
        locale,
      }),
    [
      projectName,
      weatherList,
      selectedWeather,
      comparisonMode,
      moduleCount,
      basicParams,
      gainStrategies,
      longiCalcSpec,
      competitorCalcSpec,
      longiRecord,
      compRecord,
      results,
      locale,
    ]
  );

  const handleReset = () => {
    setProjectName("");
    setSelectedWeather("");
    setComparisonMode("sameCount");
    setModuleCount("10000");
    setBasicParams(DEFAULT_BASIC_PARAMS);
    setGainStrategies(DEFAULT_GAIN_STRATEGIES);
    setHoursManualOverride(false);
    setSpecOverrides({ longi: {}, competitor: {} });
    setModulePairPreset("custom");
    clearSession();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <LocaleProvider locale={locale}>
    <main className="bg-slate-950">
      <HeroCover
        onOpenDatabase={() => setDbOpen(true)}
        currency={basicParams.currency}
        onCurrencyChange={handleCurrencyChange}
        locale={locale}
        onLocaleChange={handleLocaleChange}
      />
      <SetupSection
        projectName={projectName}
        setProjectName={setProjectName}
        selectedWeather={selectedWeather}
        setSelectedWeather={setSelectedWeather}
        comparisonMode={comparisonMode}
        setComparisonMode={setComparisonMode}
        moduleCount={moduleCount}
        setModuleCount={setModuleCount}
        basicParams={basicParams}
        setBasicParams={setBasicParams}
        weatherList={weatherList}
        hoursManualOverride={hoursManualOverride}
        setHoursManualOverride={setHoursManualOverride}
        onCurrencyChange={handleCurrencyChange}
        epcHelper={epcHelper}
      />
      <SpecsSection
        longi={longiDisplaySpec}
        competitor={competitorDisplaySpec}
        longiBase={longiBaseSpec}
        competitorBase={competitorBaseSpec}
        overriddenFields={overriddenFields}
        longiModules={visibleLongiModules}
        competitorModules={visibleCompetitorModules}
        selectedLongiId={effectiveLongiId}
        selectedCompetitorId={effectiveCompId}
        onSelectLongi={handleSelectLongi}
        onSelectCompetitor={handleSelectCompetitor}
        modulePairPreset={modulePairPreset}
        onModulePairPresetChange={handleModulePairPresetChange}
        currency={basicParams.currency}
        longiRecord={longiRecord}
        compRecord={compRecord}
        onApplyOverride={applyFieldOverride}
        onResetOverride={resetFieldOverride}
        onSaveToLibrary={saveFieldToLibrary}
      />
      <ResultsSection
        results={results}
        gainStrategies={gainStrategies}
        onGainStrategiesChange={setGainStrategies}
        longi={longiCalcSpec}
        competitor={competitorCalcSpec}
        currency={basicParams.currency}
        operationYears={basicParams.operationYears}
        getReportSnapshot={getReportSnapshot}
        onReset={handleReset}
      />

      <DatabaseDialog
        open={dbOpen}
        onOpenChange={setDbOpen}
        currency={basicParams.currency}
        longiModules={visibleLongiModules}
        competitorModules={visibleCompetitorModules}
        weatherList={weatherList}
        onUpsertModule={upsertModule}
        onDeleteModule={removeModule}
        onBulkModules={bulkAddModules}
        onUpsertWeather={upsertWeather}
        onDeleteWeather={removeWeather}
        onSyncBuiltinWeather={syncBuiltinWeather}
        onSyncBuiltinModules={syncBuiltinModules}
      />

      <AppLegalFooter />
    </main>
    </LocaleProvider>
  );
}
