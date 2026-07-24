import { describe, expect, it } from "vitest";
import {
  CASE_CATALOG,
  caseCoverSrc,
  getCaseStudyBySlug,
  listCaseStudies,
  recommendHrefForSeries,
} from "./case-catalog";
import { getProductSeriesById } from "./product-matrix-catalog";

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

  it("resolves cover from local placeholder when Drive id is absent", () => {
    const sample = getCaseStudyBySlug("sydney-residential-hvh");
    expect(sample).toBeTruthy();
    expect(caseCoverSrc(sample!)).toBe("/products/LR7-54HVH.png");
  });

  it("builds recommend deep link for series", () => {
    expect(recommendHrefForSeries("LR7-54HVH")).toBe(
      "/recommend?series=LR7-54HVH"
    );
  });
});
