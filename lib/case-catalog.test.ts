import { describe, expect, it } from "vitest";
import {
  CASE_CATALOG,
  caseCoverSrc,
  caseDrivePreviewUrl,
  caseMediaThumbSrc,
  getCaseStudyBySlug,
  listCaseStudies,
  recommendHrefForSeries,
  type CaseStudy,
} from "./case-catalog";
import { getProductSeriesById } from "./product-matrix-catalog";
import { driveThumbnailUrl } from "./product-drive-resources";

describe("case-catalog", () => {
  it("has unique slugs and linked series that exist in PRODUCT_MATRIX", () => {
    const slugs = new Set<string>();
    for (const c of CASE_CATALOG) {
      expect(slugs.has(c.slug)).toBe(false);
      slugs.add(c.slug);
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

  it("resolves cover from Drive fileId when present", () => {
    const sample = getCaseStudyBySlug("sydney-residential-hvh");
    expect(sample?.coverFileId).toBeTruthy();
    expect(caseCoverSrc(sample!)).toBe(
      driveThumbnailUrl(sample!.coverFileId!, 1200)
    );
  });

  it("falls back to local cover when Drive id is absent", () => {
    const localOnly: CaseStudy = {
      ...getCaseStudyBySlug("sydney-residential-hvh")!,
      coverFileId: undefined,
      coverLocalSrc: "/products/LR7-54HVH.png",
    };
    expect(caseCoverSrc(localOnly)).toBe("/products/LR7-54HVH.png");
  });

  it("builds Drive preview and media thumb URLs", () => {
    expect(caseDrivePreviewUrl("abc123")).toBe(
      "https://drive.google.com/file/d/abc123/preview"
    );
    const photo = getCaseStudyBySlug("brisbane-coastal-hvb")!.media[0]!;
    expect(photo.fileId).toBeTruthy();
    expect(caseMediaThumbSrc(photo)).toBe(
      driveThumbnailUrl(photo.fileId!, 800)
    );
  });

  it("builds recommend deep link for series", () => {
    expect(recommendHrefForSeries("LR7-54HVH")).toBe(
      "/recommend?series=LR7-54HVH"
    );
  });
});
