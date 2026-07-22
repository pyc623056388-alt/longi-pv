import { describe, expect, it } from "vitest";
import {
  getFrontRearPhotos,
  getProductDriveResources,
  getProductPhotos,
} from "./product-drive-resources";

describe("product-drive-resources", () => {
  it("links datasheet / warranty / IM for residential HVH", () => {
    const res = getProductDriveResources("LR7-54HVH");
    expect(res?.datasheet?.url).toContain("drive.google.com/file/d/");
    expect(res?.warranty?.url).toContain("drive.google.com/file/d/");
    expect(res?.installationManual?.url).toContain("drive.google.com/file/d/");
    expect(res?.photos.length).toBeGreaterThan(0);
    expect(res?.certificates.length).toBeGreaterThan(0);
  });

  it("covers anti-dust and lightweight series", () => {
    expect(getProductDriveResources("LR7-54HVHF")?.datasheet).toBeTruthy();
    expect(
      getProductDriveResources("LR7-60HVHL")?.installationManual
    ).toBeTruthy();
    expect(getProductDriveResources("LR7-72HVD")?.warranty).toBeTruthy();
  });

  it("links Drive folders for 72HVH and LR8-66HVD", () => {
    expect(getProductDriveResources("LR7-72HVH")?.datasheet?.fileId).toBeTruthy();
    expect(getProductDriveResources("LR7-72HVH")?.photos.length).toBe(4);
    expect(getProductDriveResources("LR8-66HVD")?.datasheet?.fileId).toBeTruthy();
    expect(getProductDriveResources("LR8-66HYD")?.datasheet?.fileId).toBeTruthy();
    expect(getProductDriveResources("LR7-54HVD")).toBeUndefined();
  });

  it("returns all product view photos sorted front→rear→side→bevel", () => {
    const hvb = getProductPhotos("LR7-54HVB");
    expect(hvb.map((p) => p.label)).toEqual([
      "Front view",
      "Rear view",
      "Side view",
      "Bevel view",
    ]);

    const noPhoto = getProductPhotos("LR7-54HVHF");
    expect(noPhoto).toEqual([]);

    const hvd72 = getProductPhotos("LR7-72HVD");
    expect(hvd72.length).toBeGreaterThan(0);
    expect(hvd72[0]?.label.toLowerCase()).toMatch(/front|rear|side|bevel/);
  });

  it("getFrontRearPhotos still returns only front/rear", () => {
    const hvb = getFrontRearPhotos("LR7-54HVB");
    expect(hvb.length).toBe(2);
    expect(hvb.every((p) => /front|rear/i.test(p.label))).toBe(true);
  });
});
