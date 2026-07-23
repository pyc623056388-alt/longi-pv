import type { ModuleRecord } from "@/lib/pv-types";

/** Strip trailing power suffix: LR7-54HVB-475M → LR7-54HVB */
export function modelFamilyFromSku(model: string): string {
  return model.trim().toUpperCase().replace(/-\d+M$/i, "");
}

/**
 * Map a recommend-page SKU (e.g. LR7-54HVB-475M) onto a module in the compare library.
 * Prefer exact model, then exact family (so HVH does not match HVHF).
 */
export function resolveLongiModuleByModelParam(
  modules: ModuleRecord[],
  modelParam: string
): ModuleRecord | undefined {
  const upper = modelParam.trim().toUpperCase();
  if (!upper || modules.length === 0) return undefined;

  const exact = modules.find((m) => m.model.toUpperCase() === upper);
  if (exact) return exact;

  const family = modelFamilyFromSku(upper);
  // Exact family only — never use includes/startsWith (HVH must not match HVHF).
  return modules.find((m) => modelFamilyFromSku(m.model) === family);
}
