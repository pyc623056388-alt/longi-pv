import { describe, expect, it } from "vitest";
import {
  LEGAL_DEVELOPER,
  LEGAL_FEEDBACK_EMAIL,
  LEGAL_SUPPORT,
} from "./legal-meta";
import { getLegalLabels, getReportLabels } from "./report-labels";

describe("legal labels", () => {
  it("includes developer and support names in attribution", () => {
    const zh = getLegalLabels("zh");
    expect(zh.attribution).toContain(LEGAL_DEVELOPER);
    expect(zh.attribution).toContain(LEGAL_SUPPORT);

    const en = getLegalLabels("en");
    expect(en.attribution).toContain(LEGAL_DEVELOPER);
    expect(en.attribution).toContain(LEGAL_SUPPORT);
  });

  it("includes feedback email", () => {
    const zh = getLegalLabels("zh");
    expect(zh.feedback).toContain(LEGAL_FEEDBACK_EMAIL);
    expect(zh.attribution).toContain("技术支持");
  });

  it("watermark warns against external distribution (zh)", () => {
    const labels = getReportLabels("zh");
    expect(labels.watermark).toContain("严禁外发");
  });

  it("watermark warns against external distribution (en)", () => {
    const labels = getReportLabels("en");
    expect(labels.watermark.toLowerCase()).toContain("do not distribute");
  });
});
