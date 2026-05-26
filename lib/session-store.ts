import type { ModulePairPresetId } from "./module-pair-presets";
import { isModulePairPresetId } from "./module-pair-presets";
import type { ModuleSpec } from "./pv-calculation";
import type {
  AntiShadingScenario,
  BasicParams,
  GainStrategies,
} from "./pv-types";
import { DEFAULT_BASIC_PARAMS, DEFAULT_GAIN_STRATEGIES } from "./pv-types";

function normalizeAntiShadingScenario(v: unknown): AntiShadingScenario {
  return v === "commercial" ? "commercial" : "residential";
}

/** 合并旧会话：补全 antiShading.scenario 等新增字段 */
export function normalizeGainStrategies(raw: GainStrategies): GainStrategies {
  return {
    ...raw,
    antiShading: {
      ...DEFAULT_GAIN_STRATEGIES.antiShading,
      ...raw.antiShading,
      scenario: normalizeAntiShadingScenario(raw.antiShading?.scenario),
    },
  };
}

const SESSION_KEY = "longi-pv:session-v1";

export type SpecOverridesSnapshot = {
  longi: Record<string, Partial<ModuleSpec>>;
  competitor: Record<string, Partial<ModuleSpec>>;
};

export type ComparisonSession = {
  projectName: string;
  selectedWeather: string;
  comparisonMode: "sameCount" | "fixedCapacity";
  moduleCount: string;
  basicParams: BasicParams;
  gainStrategies: GainStrategies;
  hoursManualOverride: boolean;
  specOverrides: SpecOverridesSnapshot;
  selectedLongiId: string;
  selectedCompetitorId: string;
  modulePairPreset: ModulePairPresetId;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isComparisonMode(v: unknown): v is ComparisonSession["comparisonMode"] {
  return v === "sameCount" || v === "fixedCapacity";
}

function isBasicParams(v: unknown): v is BasicParams {
  if (!v || typeof v !== "object") return false;
  const o = v as BasicParams;
  return (
    typeof o.tiltDeg === "number" &&
    typeof o.yearlyEquivalentHours === "number" &&
    typeof o.accessoryCostPerModule === "number" &&
    typeof o.operationYears === "number" &&
    typeof o.ppaPrice === "number" &&
    ["USD", "AUD", "NZD", "CNY"].includes(o.currency)
  );
}

function isGainStrategies(v: unknown): v is GainStrategies {
  if (!v || typeof v !== "object") return false;
  const keys = ["temperature", "antiShading", "lowLight"] as const;
  for (const k of keys) {
    const item = (v as GainStrategies)[k];
    if (!item || typeof item.enabled !== "boolean") return false;
  }
  return true;
}

function isSpecOverridesSnapshot(v: unknown): v is SpecOverridesSnapshot {
  if (!v || typeof v !== "object") return false;
  const o = v as SpecOverridesSnapshot;
  return typeof o.longi === "object" && typeof o.competitor === "object";
}

function parseSession(raw: string): ComparisonSession | null {
  try {
    const data = JSON.parse(raw) as Partial<ComparisonSession>;
    if (!isComparisonMode(data.comparisonMode)) return null;
    if (!isBasicParams(data.basicParams)) return null;
    if (!isGainStrategies(data.gainStrategies)) return null;
    if (!isSpecOverridesSnapshot(data.specOverrides)) return null;
    return {
      projectName: typeof data.projectName === "string" ? data.projectName : "",
      selectedWeather:
        typeof data.selectedWeather === "string" ? data.selectedWeather : "",
      comparisonMode: data.comparisonMode,
      moduleCount:
        typeof data.moduleCount === "string" ? data.moduleCount : "10000",
      basicParams: data.basicParams,
      gainStrategies: normalizeGainStrategies(data.gainStrategies),
      hoursManualOverride: !!data.hoursManualOverride,
      specOverrides: data.specOverrides,
      selectedLongiId:
        typeof data.selectedLongiId === "string" ? data.selectedLongiId : "",
      selectedCompetitorId:
        typeof data.selectedCompetitorId === "string"
          ? data.selectedCompetitorId
          : "",
      modulePairPreset: isModulePairPresetId(data.modulePairPreset)
        ? data.modulePairPreset
        : "custom",
    };
  } catch {
    return null;
  }
}

export function loadSession(): ComparisonSession | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return parseSession(raw);
  } catch {
    return null;
  }
}

export function saveSession(session: ComparisonSession): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* quota / private mode */
  }
}

export function clearSession(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function buildSessionSnapshot(state: {
  projectName: string;
  selectedWeather: string;
  comparisonMode: ComparisonSession["comparisonMode"];
  moduleCount: string;
  basicParams: BasicParams;
  gainStrategies: GainStrategies;
  hoursManualOverride: boolean;
  specOverrides: SpecOverridesSnapshot;
  selectedLongiId: string;
  selectedCompetitorId: string;
  modulePairPreset: ModulePairPresetId;
}): ComparisonSession {
  return { ...state };
}

export const SESSION_DEFAULTS = {
  basicParams: DEFAULT_BASIC_PARAMS,
  gainStrategies: DEFAULT_GAIN_STRATEGIES,
} as const;
