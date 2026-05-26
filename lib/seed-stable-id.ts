/** 内置库稳定 ID（build-seed 与运行时种子合并共用） */
export function slugPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
}

export function stableModuleId(
  library: "longi" | "competitor",
  manufacturer: string,
  model: string
): string {
  return `mod_${library}_${slugPart(manufacturer)}_${slugPart(model)}`;
}

export function stableWeatherId(name: string, location?: string): string {
  const base = slugPart(name) || "site";
  const loc = location ? `_${slugPart(location)}` : "";
  return `wx_${base}${loc}`.slice(0, 64);
}
