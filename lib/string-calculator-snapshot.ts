import type { AshraeVersion } from "./ashrae-meteo";
import type { StringCalcResult, StringModuleInput } from "./string-calculator";

export interface StringProjectInfo {
  clientName: string;
  projectName: string;
  location: string;
  coordinates: string;
}

export interface StringWeatherInfo {
  stationName: string;
  wmo: string;
  distanceKm: number | null;
  period: string;
  ashraeVersion: AshraeVersion | string;
  tEamdbtC: number;
  tminManual: boolean;
  sourceUrl: string;
}

export interface StringCalcSnapshot {
  generatedAtIso: string;
  project: StringProjectInfo;
  weather: StringWeatherInfo;
  voltageLimitV: number;
  modules: StringModuleInput[];
  result: StringCalcResult;
}

export function stringCalcExportBasename(
  project: StringProjectInfo,
  date = new Date()
): string {
  const ymd = date.toISOString().slice(0, 10).replaceAll("-", "");
  const safe = (value: string) =>
    value.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim();
  const client = safe(project.clientName) || "Client";
  const name = safe(project.projectName) || "Project";
  return `${ymd} String Calculation ${client} ${name}`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
