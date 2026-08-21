import { enrichModuleRecord } from "./module-library-defaults";
import { inferModuleLibrary, parsePanFileContent } from "./parsers/panfile";
import type { ModuleLibrary, ModuleRecord } from "./pv-types";
import { stableModuleId } from "./seed-id";

export function recordFromPanContent(content: string): ModuleRecord | null {
  const preview = parsePanFileContent(content, "longi");
  if (!preview) return null;
  const library = inferModuleLibrary(preview.manufacturer, preview.model);
  return enrichModuleRecord({
    ...preview,
    library,
    id: stableModuleId(library, preview.manufacturer, preview.model),
    catalogHidden: false,
  });
}

export function groupPanRecordsByLibrary(
  records: ModuleRecord[]
): Record<ModuleLibrary, ModuleRecord[]> {
  const grouped: Record<ModuleLibrary, ModuleRecord[]> = {
    longi: [],
    competitor: [],
  };
  for (const rec of records) grouped[rec.library].push(rec);
  return grouped;
}
