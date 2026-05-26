import type { ModuleLibrary } from "./pv-types";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 80);
}

export function stableModuleId(
  library: ModuleLibrary,
  manufacturer: string,
  model: string
): string {
  return `mod_${library}_${slugify(manufacturer)}_${slugify(model)}`;
}

export function stableWeatherId(city: string, fileBase: string): string {
  const base = slugify(fileBase.replace(/\.epw$/i, ""));
  const cityPart = slugify(city);
  return `wx_${cityPart}_${base}`.slice(0, 100);
}
