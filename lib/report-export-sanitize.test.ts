import { describe, expect, it } from "vitest";
import { needsSanitizeColor } from "./report-export-sanitize";

describe("needsSanitizeColor", () => {
  it("detects modern color functions", () => {
    expect(needsSanitizeColor("lab(50% 0 0)")).toBe(true);
    expect(needsSanitizeColor("oklch(0.5 0 0)")).toBe(true);
    expect(needsSanitizeColor("#E40011")).toBe(false);
    expect(needsSanitizeColor("rgb(15, 23, 42)")).toBe(false);
  });
});
