import seedData from "./seed-data.json";
import type { ModuleLibrary, ModuleRecord, WeatherRecord } from "./pv-types";

const SEED_KEY = "longi-pv:seeded-v1";
const MODULE_KEY = (lib: ModuleLibrary) => `longi-pv:modules:${lib}`;
const WEATHER_KEY = "longi-pv:weather";

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

export function ensureSeedData(): void {
  if (!isBrowser()) return;
  if (localStorage.getItem(SEED_KEY)) return;

  writeJson(MODULE_KEY("longi"), seedData.longiModules as ModuleRecord[]);
  writeJson(MODULE_KEY("competitor"), seedData.competitorModules as ModuleRecord[]);
  writeJson(WEATHER_KEY, seedData.weather as WeatherRecord[]);
  localStorage.setItem(SEED_KEY, "1");
}

export function listModules(library: ModuleLibrary): ModuleRecord[] {
  ensureSeedData();
  const fallback =
    library === "longi"
      ? (seedData.longiModules as ModuleRecord[])
      : (seedData.competitorModules as ModuleRecord[]);
  return readJson(MODULE_KEY(library), fallback);
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
