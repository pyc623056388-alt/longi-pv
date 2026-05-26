/** 从 PAN 文本读取 PVsyst Version 与 Model（用于去重/筛选） */
export function readPanMeta(content: string): {
  version: number | null;
  model: string | null;
  manufacturer: string | null;
} {
  let version: number | null = null;
  let model: string | null = null;
  let manufacturer: string | null = null;

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.substring(0, eq).trim().toLowerCase();
    const val = trimmed.substring(eq + 1).trim().replace(/"/g, "");

    if (key === "version") {
      const major = parseFloat(val);
      if (Number.isFinite(major)) version = major;
    } else if (key === "model") model = val;
    else if (key === "manufacturer") manufacturer = val;
  }

  if (!model) {
    for (const line of content.split("\n")) {
      const t = line.trim();
      if (t.startsWith("Name=") || t.startsWith("name=")) {
        model = t.split("=")[1]?.trim().replace(/"/g, "") ?? null;
        break;
      }
    }
  }

  return { version, model, manufacturer };
}

export function normalizeModelKey(model: string): string {
  return model.replace(/\(\d+\)$/i, "").trim().toLowerCase();
}
