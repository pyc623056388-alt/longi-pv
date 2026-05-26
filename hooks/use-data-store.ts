"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addModule,
  addWeather,
  deleteModule,
  deleteWeather,
  ensureSeedData,
  listModules,
  listWeather,
  saveModules,
  saveWeather,
  syncBuiltinWeather,
  syncBuiltinModules,
} from "@/lib/data-store";
import type { ModuleLibrary, ModuleRecord, WeatherRecord } from "@/lib/pv-types";

export function useDataStore() {
  const [longiModules, setLongiModules] = useState<ModuleRecord[]>([]);
  const [competitorModules, setCompetitorModules] = useState<ModuleRecord[]>([]);
  const [weatherList, setWeatherList] = useState<WeatherRecord[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    ensureSeedData();
    setLongiModules(listModules("longi"));
    setCompetitorModules(listModules("competitor"));
    setWeatherList(listWeather());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upsertModule = useCallback(
    (library: ModuleLibrary, module: ModuleRecord) => {
      addModule(library, module);
      refresh();
    },
    [refresh]
  );

  const removeModule = useCallback(
    (library: ModuleLibrary, id: string) => {
      deleteModule(library, id);
      refresh();
    },
    [refresh]
  );

  const bulkAddModules = useCallback(
    (library: ModuleLibrary, modules: ModuleRecord[]) => {
      const existing = listModules(library);
      const merged = [...existing];
      for (const m of modules) {
        const idx = merged.findIndex((x) => x.id === m.id);
        if (idx >= 0) merged[idx] = m;
        else merged.push(m);
      }
      saveModules(library, merged);
      refresh();
    },
    [refresh]
  );

  const upsertWeather = useCallback(
    (record: WeatherRecord) => {
      addWeather(record);
      refresh();
    },
    [refresh]
  );

  const removeWeather = useCallback(
    (id: string) => {
      deleteWeather(id);
      refresh();
    },
    [refresh]
  );

  const bulkAddWeather = useCallback(
    (records: WeatherRecord[]) => {
      const existing = listWeather();
      saveWeather([...existing, ...records]);
      refresh();
    },
    [refresh]
  );

  const syncBuiltinWeatherFromSeed = useCallback(() => {
    syncBuiltinWeather();
    refresh();
  }, [refresh]);

  const syncBuiltinModulesFromSeed = useCallback(() => {
    syncBuiltinModules();
    refresh();
  }, [refresh]);

  return {
    ready,
    longiModules,
    competitorModules,
    weatherList,
    refresh,
    upsertModule,
    removeModule,
    bulkAddModules,
    upsertWeather,
    removeWeather,
    bulkAddWeather,
    syncBuiltinWeather: syncBuiltinWeatherFromSeed,
    syncBuiltinModules: syncBuiltinModulesFromSeed,
  };
}
