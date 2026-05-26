import { describe, expect, it } from "vitest";
import { DEFAULT_BASIC_PARAMS, DEFAULT_GAIN_STRATEGIES } from "./pv-types";

/** parseSession 逻辑通过 loadSession 在浏览器环境测试；此处直接测 JSON 往返形状 */
describe("session snapshot shape", () => {
  it("round-trips comparison session fields", () => {
    const session = {
      projectName: "测试项目",
      selectedWeather: "wx_1",
      comparisonMode: "sameCount" as const,
      moduleCount: "5000",
      basicParams: DEFAULT_BASIC_PARAMS,
      gainStrategies: DEFAULT_GAIN_STRATEGIES,
      hoursManualOverride: true,
      specOverrides: {
        longi: { mod_a: { price: "0.9" } },
        competitor: {},
      },
      selectedLongiId: "mod_a",
      selectedCompetitorId: "mod_b",
    };
    const raw = JSON.stringify(session);
    const parsed = JSON.parse(raw);
    expect(parsed.projectName).toBe("测试项目");
    expect(parsed.specOverrides.longi.mod_a.price).toBe("0.9");
    expect(parsed.comparisonMode).toBe("sameCount");
  });
});
