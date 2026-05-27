import { describe, expect, it } from "vitest";
import { localizeManufacturer, moduleDisplayName } from "./module-labels";
import type { ModuleRecord } from "@/lib/pv-types";

describe("localizeManufacturer", () => {
  it("maps 竞品 to Competitor in English", () => {
    expect(localizeManufacturer("竞品", "en")).toBe("Competitor");
  });

  it("maps 竞品 to 竞品 in Chinese", () => {
    expect(localizeManufacturer("竞品", "zh")).toBe("竞品");
  });

  it("maps Competitor placeholder in Chinese", () => {
    expect(localizeManufacturer("Competitor", "zh")).toBe("竞品");
  });

  it("leaves real brand names unchanged", () => {
    expect(localizeManufacturer("Jinko", "en")).toBe("Jinko");
  });
});

describe("moduleDisplayName", () => {
  const record: ModuleRecord = {
    id: "x",
    manufacturer: "竞品",
    model: "LR7-54HVH-485M",
    powerWp: 485,
    library: "competitor",
    source: "manual",
  };

  it("localizes manufacturer in English", () => {
    expect(moduleDisplayName(record, "en")).toBe("Competitor LR7-54HVH-485M");
  });

  it("keeps Chinese label in zh locale", () => {
    expect(moduleDisplayName(record, "zh")).toBe("竞品 LR7-54HVH-485M");
  });
});
