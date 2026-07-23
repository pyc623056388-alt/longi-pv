/** Hi-MO X10 版型特征：从型号后缀推断（HVH / HVD / HVHL / *F 等） */

export type ModuleFamily = "hvh" | "hvd" | "hvhl" | "unknown";

export interface ModuleVariantFeatures {
  family: ModuleFamily;
  /** 防积灰边框版型（型号含 HVHF / HVDF） */
  antiDust: boolean;
  /** 防眩光版型（HVH/HVD 且非 F） */
  antiGlare: boolean;
  /** 轻质版型（HVHL） */
  lightweight: boolean;
  /** HPBC 系列共性：防局部过热 / 抗热斑 */
  antiHotspot: boolean;
  /** HPBC 系列共性：抗阴影遮挡 */
  antiShading: boolean;
}

export function inferFamilyFromModel(model: string): ModuleFamily {
  const upper = model.toUpperCase();
  if (upper.includes("HVHL")) return "hvhl";
  if (upper.includes("HVHF") || upper.includes("HVB") || upper.includes("HVH")) {
    return "hvh";
  }
  if (upper.includes("HVDF") || upper.includes("HVD")) return "hvd";
  return "unknown";
}

/** 是否为防积灰（F）后缀版型 */
export function isAntiDustModel(model: string): boolean {
  const upper = model.toUpperCase();
  return upper.includes("HVHF") || upper.includes("HVDF");
}

export function inferModuleVariantFeatures(model: string): ModuleVariantFeatures {
  const family = inferFamilyFromModel(model);
  const antiDust = isAntiDustModel(model);
  const lightweight = family === "hvhl";
  const isHpbcLine = family !== "unknown";
  const antiGlare =
    isHpbcLine && !antiDust && !lightweight && (family === "hvh" || family === "hvd");

  return {
    family,
    antiDust,
    antiGlare,
    lightweight,
    antiHotspot: isHpbcLine,
    antiShading: isHpbcLine,
  };
}
