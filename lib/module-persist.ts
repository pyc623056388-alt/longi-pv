import type { ModuleSpec } from "./pv-calculation";
import {
  applySpecFieldToRecord,
  type ModuleSpecField,
} from "./module-utils";
import type { ModuleRecord } from "./pv-types";
import {
  validateModuleForStorage,
  validateModuleMinimal,
} from "./parsers/panfile";

const SPEC_FIELDS_FOR_RECORD: ModuleSpecField[] = [
  "power",
  "dimensions",
  "tempCoef",
  "firstYearDeg",
  "annualDeg",
  "price",
];

/** 将对比会话中的 specOverrides 合并进 ModuleRecord */
export function recordWithAllOverrides(
  record: ModuleRecord,
  overrides?: Partial<ModuleSpec>
): ModuleRecord {
  if (!overrides) return record;
  let next = record;
  for (const field of SPEC_FIELDS_FOR_RECORD) {
    const value = overrides[field];
    if (value !== undefined && String(value).trim()) {
      next = applySpecFieldToRecord(next, field, String(value));
    }
  }
  return next;
}

export type PersistModuleResult =
  | { ok: true; record: ModuleRecord; warnings: string[] }
  | { ok: false; errors: string[] };

/** 与数据库对话框一致：minimal 失败阻断；full 缺失仅 warning，仍返回可保存记录 */
export function prepareModuleForPersist(
  record: ModuleRecord
): PersistModuleResult {
  const minimal = validateModuleMinimal(record);
  if (minimal.length) {
    return { ok: false, errors: minimal };
  }
  const full = validateModuleForStorage(record);
  const warnings = full.filter((e) => !minimal.includes(e));
  return { ok: true, record, warnings };
}
