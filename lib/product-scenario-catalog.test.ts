import { describe, expect, it } from "vitest";
import {
  getScenarioById,
  listScenarios,
  listVisibleScenarios,
  normalizeModelId,
  resolveModelIds,
  scenarioFlatSeries,
  scenarioGradeGroups,
  scenarioHasGrades,
  scenarioIncludesSeries,
} from "./product-scenario-catalog";

describe("product-scenario-catalog", () => {
  it("normalizes LR7-54HVDT alias to LR7-54HVD", () => {
    expect(normalizeModelId("LR7-54HVDT")).toBe("LR7-54HVD");
    expect(normalizeModelId("LR7-72HVD")).toBe("LR7-72HVD");
  });

  it("resolves aliases and drops unknown models (e.g. LR7-72HVDA)", () => {
    const resolved = resolveModelIds(["LR7-54HVDT", "LR7-72HVDA", "LR7-72HVD"]);
    const ids = resolved.map((s) => s.id);
    expect(ids).toContain("LR7-54HVD");
    expect(ids).toContain("LR7-72HVD");
    expect(ids).not.toContain("LR7-72HVDA");
  });

  it("dedupes repeated model ids", () => {
    const resolved = resolveModelIds(["LR7-54HVH", "LR7-54HVH"]);
    expect(resolved).toHaveLength(1);
  });

  it("hides Agri-Ammonia / Marine / Fire-ClassA from visible list", () => {
    const visibleIds = listVisibleScenarios().map((s) => s.id);
    expect(visibleIds).toHaveLength(7);
    expect(visibleIds).not.toContain("agri-ammonia");
    expect(visibleIds).not.toContain("marine");
    expect(visibleIds).not.toContain("fire-classa");
    expect(visibleIds[0]).toBe("standard");
  });

  it("keeps exactly one featured scenario (standard)", () => {
    const featured = listScenarios().filter((s) => s.featured);
    expect(featured).toHaveLength(1);
    expect(featured[0].id).toBe("standard");
  });

  it("treats _base as no-grade and named grades as graded", () => {
    const standard = getScenarioById("standard")!;
    const antiglare = getScenarioById("antiglare")!;
    expect(scenarioHasGrades(standard)).toBe(false);
    expect(scenarioHasGrades(antiglare)).toBe(true);
  });

  it("collapses Standard _base to deduped series incl. HVDT->HVD", () => {
    const standard = getScenarioById("standard")!;
    const ids = scenarioFlatSeries(standard).map((s) => s.id);
    expect(ids).toContain("LR7-54HVD");
    expect(ids).toContain("LR7-72HVH");
    expect(ids).toHaveLength(6);
  });

  it("Anti-Dust only lists F-suffix variants (HVHF / HVDF)", () => {
    const antidust = getScenarioById("antidust")!;
    const ids = scenarioFlatSeries(antidust).map((s) => s.id);
    expect(ids).toEqual([
      "LR7-54HVHF",
      "LR7-72HVDF",
      "LR7-72HVHF",
      "LR8-66HVDF",
    ]);
    expect(ids.every((id) => /HV[A-Z]*F$/i.test(id))).toBe(true);
    expect(antidust.heroSeriesId).toBe("LR7-72HVHF");
  });

  it("groups AntiGlare into 1.0 and 2.0 grades", () => {
    const antiglare = getScenarioById("antiglare")!;
    const groups = scenarioGradeGroups(antiglare);
    expect(groups.map((g) => g.key)).toEqual(["1.0", "2.0"]);
    expect(groups[0].series.length).toBeGreaterThan(0);
  });

  it("Fire-ClassA drops LR7-72HVDA leaving only LR8-66HYD", () => {
    const fire = getScenarioById("fire-classa")!;
    const ids = scenarioFlatSeries(fire).map((s) => s.id);
    expect(ids).toEqual(["LR8-66HYD"]);
  });

  it("scenarioIncludesSeries validates membership", () => {
    const standard = getScenarioById("standard")!;
    expect(scenarioIncludesSeries(standard, "LR7-54HVD")).toBe(true);
    expect(scenarioIncludesSeries(standard, "LR8-66HYD")).toBe(false);
  });
});
