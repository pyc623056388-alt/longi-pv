import { describe, expect, it } from "vitest";
import {
  CASE_CATALOG,
  caseCoverSrc,
  caseDrivePreviewUrl,
  caseMediaThumbSrc,
  emptyCaseFilters,
  filterCaseStudies,
  getCaseFilterOptions,
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
  it("has unique slugs, youtube ids, tags, and linked series in PRODUCT_MATRIX", () => {
    const slugs = new Set<string>();
    expect(CASE_CATALOG.length).toBe(7);
    for (const c of CASE_CATALOG) {
      expect(slugs.has(c.slug)).toBe(false);
      slugs.add(c.slug);
      expect(c.youtubeVideoId).toBeTruthy();
      expect(c.media.some((m) => m.youtubeVideoId === c.youtubeVideoId)).toBe(
        true
      );
      expect(["AU", "NZ"]).toContain(c.country);
      expect(["residential", "commercial"]).toContain(c.sector);
      expect(["lt50", "50to100", "gt100", "unspecified"]).toContain(c.scale);
      expect(typeof c.region).toBe("string");
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

  it("aggregates filter options without empty regions", () => {
    const options = getCaseFilterOptions(CASE_CATALOG);
    expect(options.countries).toEqual(["AU", "NZ"]);
    expect(options.regions).toContain("Auckland");
    expect(options.regions).toContain("NSW");
    expect(options.regions).not.toContain("");
    expect(options.sectors).toEqual(["residential", "commercial"]);
    expect(options.scales).toContain("lt50");
    expect(options.scales).toContain("50to100");
    expect(options.scales).toContain("unspecified");
    expect(options.seriesIds).toContain("LR7-54HVH");
    expect(options.seriesIds).toContain("LR7-72HVD");
  });

  it("filters by single dimension", () => {
    const au = filterCaseStudies(CASE_CATALOG, {
      ...emptyCaseFilters(),
      country: "AU",
    });
    expect(au.every((c) => c.country === "AU")).toBe(true);
    expect(au.map((c) => c.slug).sort()).toEqual([
      "glenmore-park-high-school",
      "james-treble-home",
    ]);

    const residential = filterCaseStudies(CASE_CATALOG, {
      ...emptyCaseFilters(),
      sector: "residential",
    });
    expect(residential).toHaveLength(2);
    expect(residential.every((c) => c.sector === "residential")).toBe(true);
  });

  it("applies AND across multiple filters and series match", () => {
    const anded = filterCaseStudies(CASE_CATALOG, {
      country: "NZ",
      region: "Auckland",
      sector: "commercial",
      scale: "",
      seriesId: "LR7-72HVD",
    });
    expect(anded.length).toBeGreaterThan(0);
    expect(
      anded.every(
        (c) =>
          c.country === "NZ" &&
          c.region === "Auckland" &&
          c.sector === "commercial" &&
          c.seriesIds.includes("LR7-72HVD")
      )
    ).toBe(true);

    const none = filterCaseStudies(CASE_CATALOG, {
      country: "AU",
      region: "Auckland",
      sector: "",
      scale: "",
      seriesId: "",
    });
    expect(none).toHaveLength(0);
  });

  it("returns full catalog when filters are empty", () => {
    expect(filterCaseStudies(CASE_CATALOG, emptyCaseFilters())).toHaveLength(
      CASE_CATALOG.length
    );
  });
});
