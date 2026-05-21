"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { AppLocale } from "@/components/language-switcher";
import { HeroCover } from "@/components/hero-cover";
import { SetupSection } from "@/components/setup-section";
import { SpecsSection } from "@/components/specs-section";
import { ResultsSection } from "@/components/results-section";
import { DatabaseDialog } from "@/components/database-dialog";
import { useDataStore } from "@/hooks/use-data-store";
import { calculatePvComparison } from "@/lib/pv-calculation";
import type { ModuleSpec } from "@/lib/pv-calculation";
import {
  applySpecFieldToRecord,
  mergeModuleSpec,
  moduleRecordToSpec,
  moduleSpecForCalculation,
  type ModuleSpecField,
} from "@/lib/module-utils";
import { validateModuleForStorage } from "@/lib/parsers/panfile";
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

export type SpecOverridesState = {
  longi: Record<string, Partial<ModuleSpec>>;
  competitor: Record<string, Partial<ModuleSpec>>;
};

const FALLBACK_LONGI = {
  id: "fallback-l",
  manufacturer: "LONGi",
  model: "Hi-MO 7",
  powerWp: 590,
  lengthMm: 2278,
  widthMm: 1134,
  pmpTempCoef: -0.29,
  firstYearDegradationPct: 1,
  annualDegradationPct: 0.4,
  pricePerW: 0.95,
  library: "longi" as const,
};

const FALLBACK_COMP = {
  id: "fallback-c",
  manufacturer: "竞品",
  model: "TOPCon",
  powerWp: 580,
  lengthMm: 2278,
  widthMm: 1134,
  pmpTempCoef: -0.34,
  firstYearDegradationPct: 1.5,
  annualDegradationPct: 0.45,
  pricePerW: 0.88,
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

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored === "zh" || stored === "en") setLocale(stored);
    } catch {
      /* ignore */
    }
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
    weatherList,
    upsertModule,
    removeModule,
    bulkAddModules,
    upsertWeather,
    removeWeather,
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
      competitorModules.length &&
      !competitorModules.some((m) => m.id === selectedCompetitorId)
    ) {
      setSelectedCompetitorId(competitorModules[0].id);
    }
  }, [competitorModules, selectedCompetitorId]);

  const effectiveLongiId =
    selectedLongiId && longiModules.some((m) => m.id === selectedLongiId)
      ? selectedLongiId
      : longiModules[0]?.id ?? "";
  const effectiveCompId =
    selectedCompetitorId &&
    competitorModules.some((m) => m.id === selectedCompetitorId)
      ? selectedCompetitorId
      : competitorModules[0]?.id ?? "";

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
    () => moduleSpecForCalculation(longiDisplaySpec),
    [longiDisplaySpec]
  );

  const competitorCalcSpec = useMemo(
    () => moduleSpecForCalculation(competitorDisplaySpec),
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
        `已切换为 ${CURRENCY_LABELS[next]}，相关金额已按汇率换算`
      );
    },
    [
      basicParams.currency,
      longiModules,
      competitorModules,
      upsertModule,
      convertSpecOverridesForCurrency,
    ]
  );

  const saveFieldToLibrary = useCallback(
    (field: ModuleSpecField, values: { longi: string; competitor: string }) => {
      if (longiRecord && values.longi.trim()) {
        const updated = applySpecFieldToRecord(longiRecord, field, values.longi);
        const errs = validateModuleForStorage(updated);
        if (errs.length) {
          toast.error(`隆基：${errs.join("；")}`);
          return;
        }
        upsertModule("longi", updated);
      }
      if (compRecord && values.competitor.trim()) {
        const updated = applySpecFieldToRecord(
          compRecord,
          field,
          values.competitor
        );
        const errs = validateModuleForStorage(updated);
        if (errs.length) {
          toast.error(`竞品：${errs.join("；")}`);
          return;
        }
        upsertModule("competitor", updated);
      }
      resetFieldOverride(field);
    },
    [longiRecord, compRecord, upsertModule, resetFieldOverride]
  );

  const results = useMemo(
    () =>
      calculatePvComparison({
        moduleCount: Math.max(1, parseInt(moduleCount, 10) || 1),
        mode: comparisonMode,
        longi: longiCalcSpec,
        competitor: competitorCalcSpec,
        basicParams,
        gainStrategies,
      }),
    [
      moduleCount,
      comparisonMode,
      longiCalcSpec,
      competitorCalcSpec,
      basicParams,
      gainStrategies,
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
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
      />
      <SpecsSection
        longi={longiDisplaySpec}
        competitor={competitorDisplaySpec}
        longiBase={longiBaseSpec}
        competitorBase={competitorBaseSpec}
        overriddenFields={overriddenFields}
        longiModules={longiModules}
        competitorModules={competitorModules}
        selectedLongiId={effectiveLongiId}
        selectedCompetitorId={effectiveCompId}
        onSelectLongi={setSelectedLongiId}
        onSelectCompetitor={setSelectedCompetitorId}
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
        onReset={handleReset}
      />

      <DatabaseDialog
        open={dbOpen}
        onOpenChange={setDbOpen}
        currency={basicParams.currency}
        longiModules={longiModules}
        competitorModules={competitorModules}
        weatherList={weatherList}
        onUpsertModule={upsertModule}
        onDeleteModule={removeModule}
        onBulkModules={bulkAddModules}
        onUpsertWeather={upsertWeather}
        onDeleteWeather={removeWeather}
      />
    </main>
  );
}
