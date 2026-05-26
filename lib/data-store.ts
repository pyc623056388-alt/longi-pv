import topconPresetModules from "../data/builtin/topcon-preset-modules.json";
import { enrichModuleRecord } from "./module-library-defaults";
import seedData from "./seed-data.json";
import type { ModuleLibrary, ModuleRecord, WeatherRecord } from "./pv-types";

const TOPCON_PRESET_MODULES = topconPresetModules as ModuleRecord[];

const SEED_KEY_V1 = "longi-pv:seeded-v1";
const SEED_KEY_V2 = "longi-pv:seeded-v2";
const SEED_KEY_V3 = "longi-pv:seeded-v3";
const SEED_KEY_V4 = "longi-pv:seeded-v4";
const SEED_KEY_V5 = "longi-pv:seeded-v5";
const SEED_KEY = "longi-pv:seeded-v6";
const MODULE_KEY = (lib: ModuleLibrary) => `longi-pv:modules:${lib}`;
const WEATHER_KEY = "longi-pv:weather";

const MIN_BUILTIN_WEATHER_COUNT = 20;
const MIN_VALID_YEARLY_HOURS = 500;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

function mergeById<T extends { id: string }>(existing: T[], incoming: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of existing) map.set(item.id, item);
  for (const item of incoming) {
    if (!map.has(item.id)) map.set(item.id, item);
  }
  return [...map.values()];
}

function withTopconPresets(modules: ModuleRecord[]): ModuleRecord[] {
  return mergeById(modules, TOPCON_PRESET_MODULES);
}

function enrichModuleList(modules: ModuleRecord[]): ModuleRecord[] {
  return modules.map(enrichModuleRecord);
}

function weatherNeedsRefresh(weather: WeatherRecord[]): boolean {
  if (weather.length < MIN_BUILTIN_WEATHER_COUNT) return true;
  return weather.some(
    (w) =>
      (w.yearlyEquivalentHours ?? 0) < MIN_VALID_YEARLY_HOURS ||
      (w.monthlyIrradianceKwhM2Day?.[0] ?? 0) < 2
  );
}

export function ensureSeedData(): void {
  if (!isBrowser()) return;

  const hadV1 = !!localStorage.getItem(SEED_KEY_V1);
  const hadV2 = !!localStorage.getItem(SEED_KEY_V2);
  const hadV3 = !!localStorage.getItem(SEED_KEY_V3);
  const hadV4 = !!localStorage.getItem(SEED_KEY_V4);
  const hadV5 = !!localStorage.getItem(SEED_KEY_V5);
  const hadV6 = !!localStorage.getItem(SEED_KEY);

  const seedLongi = seedData.longiModules as ModuleRecord[];
  const seedCompetitor = seedData.competitorModules as ModuleRecord[];
  const seedWeather = seedData.weather as WeatherRecord[];

  if (!hadV6 && !hadV5 && !hadV4 && !hadV3 && !hadV2 && !hadV1) {
    writeJson(MODULE_KEY("longi"), enrichModuleList(seedLongi));
    writeJson(
      MODULE_KEY("competitor"),
      enrichModuleList(withTopconPresets(seedCompetitor))
    );
    writeJson(WEATHER_KEY, seedWeather);
    localStorage.setItem(SEED_KEY, "1");
    return;
  }

  if (!hadV6 && hadV5) {
    const longi = enrichModuleList(
      readJson(MODULE_KEY("longi"), seedLongi)
    );
    const competitor = enrichModuleList(
      readJson(MODULE_KEY("competitor"), seedCompetitor)
    );
    writeJson(MODULE_KEY("longi"), longi);
    writeJson(
      MODULE_KEY("competitor"),
      withTopconPresets(competitor)
    );
    localStorage.setItem(SEED_KEY, "1");
    return;
  }

  if (!hadV6 && !hadV5 && (hadV4 || hadV3 || hadV2 || hadV1)) {
    const competitor = readJson(MODULE_KEY("competitor"), seedCompetitor);
    const weather = readJson(WEATHER_KEY, seedWeather);

    writeJson(MODULE_KEY("longi"), enrichModuleList(seedLongi));
    writeJson(
      MODULE_KEY("competitor"),
      enrichModuleList(withTopconPresets(mergeById(competitor, seedCompetitor)))
    );

    const nextWeather = weatherNeedsRefresh(weather)
      ? seedWeather
      : mergeById(weather, seedWeather);
    writeJson(WEATHER_KEY, nextWeather);

    localStorage.setItem(SEED_KEY, "1");
    if (hadV4) localStorage.removeItem(SEED_KEY_V4);
    if (hadV3) localStorage.removeItem(SEED_KEY_V3);
    if (hadV2) localStorage.removeItem(SEED_KEY_V2);
    if (hadV1) localStorage.removeItem(SEED_KEY_V1);
    if (hadV5) localStorage.removeItem(SEED_KEY_V5);
  }
}

/** 用当前 seed-data.json 中的气象库覆盖 localStorage（保留组件库） */
export function syncBuiltinWeather(): void {
  if (!isBrowser()) return;
  const seedWeather = seedData.weather as WeatherRecord[];
  writeJson(WEATHER_KEY, seedWeather);
  localStorage.setItem(SEED_KEY, "1");
}

/** 用当前 seed-data.json 中的隆基 / 竞品库覆盖 localStorage */
export function syncBuiltinModules(): void {
  if (!isBrowser()) return;
  writeJson(
    MODULE_KEY("longi"),
    enrichModuleList(seedData.longiModules as ModuleRecord[])
  );
  writeJson(
    MODULE_KEY("competitor"),
    enrichModuleList(
      withTopconPresets(seedData.competitorModules as ModuleRecord[])
    )
  );
  localStorage.setItem(SEED_KEY, "1");
}

export function listModules(library: ModuleLibrary): ModuleRecord[] {
  ensureSeedData();
  const fallback =
    library === "longi"
      ? enrichModuleList(seedData.longiModules as ModuleRecord[])
      : enrichModuleList(
          withTopconPresets(seedData.competitorModules as ModuleRecord[])
        );
  const modules = readJson(MODULE_KEY(library), fallback);
  const merged =
    library === "competitor" ? withTopconPresets(modules) : modules;
  return enrichModuleList(merged);
}

export function saveModules(library: ModuleLibrary, modules: ModuleRecord[]): void {
  writeJson(MODULE_KEY(library), modules);
}

export function addModule(library: ModuleLibrary, module: ModuleRecord): void {
  const list = listModules(library);
  saveModules(library, [...list.filter((m) => m.id !== module.id), module]);
}

export function updateModule(library: ModuleLibrary, module: ModuleRecord): void {
  addModule(library, module);
}

export function deleteModule(library: ModuleLibrary, id: string): void {
  saveModules(
    library,
    listModules(library).filter((m) => m.id !== id)
  );
}

export function getModuleById(
  library: ModuleLibrary,
  id: string
): ModuleRecord | undefined {
  return listModules(library).find((m) => m.id === id);
}

export function listWeather(): WeatherRecord[] {
  ensureSeedData();
  return readJson(WEATHER_KEY, seedData.weather as WeatherRecord[]);
}

export function saveWeather(records: WeatherRecord[]): void {
  writeJson(WEATHER_KEY, records);
}

export function addWeather(record: WeatherRecord): void {
  const list = listWeather();
  saveWeather([...list.filter((w) => w.id !== record.id), record]);
}

export function deleteWeather(id: string): void {
  saveWeather(listWeather().filter((w) => w.id !== id));
}

export function getWeatherById(id: string): WeatherRecord | undefined {
  return listWeather().find((w) => w.id === id);
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** 内置库默认气象站（悉尼） */
export function getDefaultWeatherId(): string | undefined {
  const list = seedData.weather as WeatherRecord[];
  const sydney = list.find((w) => w.id === "wx_sydney");
  if (sydney) return sydney.id;
  return (
    list.find(
      (w) =>
        w.id.includes("sydney") ||
        w.name?.toLowerCase().includes("sydney") ||
        w.location?.toLowerCase().includes("sydney")
    )?.id ?? list[0]?.id
  );
}
