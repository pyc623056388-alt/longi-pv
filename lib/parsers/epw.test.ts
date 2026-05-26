import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { parseEpwContent } from "./epw";

const SYDNEY_EPW = path.join(
  process.cwd(),
  "data/builtin/weather/epw/AUS_sydney.epw"
);

describe("parseEpwContent", () => {
  it("computes daily irradiance and yearly hours for Sydney EPW", () => {
    if (!fs.existsSync(SYDNEY_EPW)) {
      console.warn("skip: AUS_sydney.epw not found, run npm run fetch:epw");
      return;
    }
    const content = fs.readFileSync(SYDNEY_EPW, "utf8");
    const record = parseEpwContent(content, {
      stableId: "wx_test_sydney",
      displayName: "悉尼 Sydney",
    });
    expect(record).not.toBeNull();
    expect(record!.monthlyIrradianceKwhM2Day![0]).toBeGreaterThan(4);
    expect(record!.yearlyEquivalentHours).toBeGreaterThan(1200);
    expect(record!.yearlyEquivalentHours).toBeLessThan(2500);
  });
});
