export type ModuleCellCount = 54 | 60 | 66 | 72;

/** Static product graphic (60-cell bevel); does not change with module selection. */
export const LONGI_PRODUCT_HERO_IMAGE =
  "/product-graphics/cell-60-bevel.png";

const SUPPORTED_CELL_COUNTS: ModuleCellCount[] = [54, 60, 66, 72];

/** Parse cell count from model name, e.g. LR7-54HVD-475M → 54 */
export function inferCellCountFromModel(model: string): ModuleCellCount | null {
  const match = String(model || "").match(/lr\d+[-_]?(\d{2})/i);
  if (!match) return null;

  const count = parseInt(match[1], 10) as ModuleCellCount;
  return SUPPORTED_CELL_COUNTS.includes(count) ? count : null;
}
