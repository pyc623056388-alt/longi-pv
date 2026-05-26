import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

describe("builtin seed data (curated)", () => {
  it("build-seed.mjs produces 14 longi and 10 competitor modules", () => {
    execSync("node scripts/build-seed.mjs", {
      cwd: path.join(process.cwd()),
      stdio: "pipe",
    });
    const seedPath = path.join(process.cwd(), "lib", "seed-data.json");
    const manifestPath = path.join(process.cwd(), "data/builtin/manifest.json");
    const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

    expect(seed.longiModules).toHaveLength(14);
    const powers = seed.longiModules.map((m: { powerWp: number }) => m.powerWp).sort(
      (a: number, b: number) => a - b
    );
    expect(powers).toEqual([
      475, 475, 475, 475, 475, 540, 540, 540, 650, 650, 650, 650, 650, 650,
    ]);

    const models = seed.longiModules.map((m: { model: string }) => m.model);
    expect(models).not.toContain("LR7-72HJD-650M");
    expect(models).toContain("LR7-54HVD-T-475M");
    expect(models).toContain("LR8-66HVD-650M");
    expect(seed.longiModules.every((m: { manufacturer: string }) => m.manufacturer === "LONGi Solar")).toBe(
      true
    );

    expect(seed.longiModules[0].voc).toBeDefined();
    expect(manifest.longi.catalogCount).toBe(14);
    expect(seed.competitorModules.length).toBe(10);
    expect(manifest.longi.filtered).toBe(true);
    expect(manifest.competitor.fromDatasheet).toBe(true);
    expect(seed.weather.length).toBeGreaterThanOrEqual(40);

    const has630Pan = seed.competitorModules.some((m: { model: string; powerWp: number }) =>
      /JKM6[34]0/.test(m.model)
    );
    expect(has630Pan).toBe(true);
    const hasOldUtilityPan = seed.competitorModules.some(
      (m: { powerWp: number }) => m.powerWp >= 700
    );
    expect(hasOldUtilityPan).toBe(false);
  });
});
