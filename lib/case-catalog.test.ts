import { describe, expect, it } from "vitest";
import {
  CASE_CATALOG,
  caseCoverSrc,
  caseDrivePreviewUrl,
  caseMediaThumbSrc,
  getCaseStudyBySlug,
  listCaseStudies,
  recommendHrefForSeries,
  youtubeEmbedUrl,
  youtubeThumbUrl,
  type CaseStudy,
} from "./case-catalog";
import { getProductSeriesById } from "./product-matrix-catalog";
import { driveThumbnailUrl } from "./product-drive-resources";

describe("case-catalog", () => {
  it("has unique slugs, youtube ids, and linked series in PRODUCT_MATRIX", () => {
    const slugs = new Set<string>();
    expect(CASE_CATALOG.length).toBe(7);
    for (const c of CASE_CATALOG) {
      expect(slugs.has(c.slug)).toBe(false);
      slugs.add(c.slug);
      expect(c.youtubeVideoId).toBeTruthy();
      expect(c.media.some((m) => m.youtubeVideoId === c.youtubeVideoId)).toBe(
        true
      );
      expect(c.seriesIds.length).toBeGreaterThan(0);
      for (const id of c.seriesIds) {
        expect(getProductSeriesById(id)).toBeTruthy();
      }
    }
  });

  it("lists newest publishedAt first", () => {
    const listed = listCaseStudies();
    for (let i = 1; i < listed.length; i++) {
      expect(
        listed[i - 1]!.publishedAt.localeCompare(listed[i]!.publishedAt)
      ).toBeGreaterThanOrEqual(0);
    }
  });

  it("resolves cover and thumbs from YouTube when present", () => {
    const sample = getCaseStudyBySlug("ponsonby-residential");
    expect(sample?.youtubeVideoId).toBe("21GHXk1eeBo");
    expect(caseCoverSrc(sample!)).toBe(youtubeThumbUrl("21GHXk1eeBo"));
    const video = sample!.media[0]!;
    expect(caseMediaThumbSrc(video)).toBe(youtubeThumbUrl("21GHXk1eeBo"));
    expect(youtubeEmbedUrl("21GHXk1eeBo")).toBe(
      "https://www.youtube.com/embed/21GHXk1eeBo"
    );
  });

  it("falls back to Drive / local cover when YouTube id is absent", () => {
    const localOnly: CaseStudy = {
      ...getCaseStudyBySlug("ponsonby-residential")!,
      youtubeVideoId: undefined,
      coverFileId: "driveCoverId",
      coverLocalSrc: "/products/LR7-54HVH.png",
    };
    expect(caseCoverSrc(localOnly)).toBe(
      driveThumbnailUrl("driveCoverId", 1200)
    );
    const noDrive: CaseStudy = {
      ...localOnly,
      coverFileId: undefined,
    };
    expect(caseCoverSrc(noDrive)).toBe("/products/LR7-54HVH.png");
  });

  it("builds Drive preview URL", () => {
    expect(caseDrivePreviewUrl("abc123")).toBe(
      "https://drive.google.com/file/d/abc123/preview"
    );
  });

  it("builds recommend deep link for series", () => {
    expect(recommendHrefForSeries("LR7-54HVH")).toBe(
      "/recommend?series=LR7-54HVH"
    );
  });
});
