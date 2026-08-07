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

  it("wires mid-size 60-cell photos and unified 72 datasheets", () => {
    expect(getProductPhotos("LR7-60HVH").length).toBe(4);
    expect(getProductPhotos("LR7-60HVD").length).toBe(4);
    expect(getProductPhotos("LR7-60HVHL").length).toBe(4);
    expect(getProductDriveResources("LR7-72HVD")?.datasheet?.fileId).toBe(
      "1d0ELAektPSX7L21m-EiHa7dS8MI1L4F2"
    );
    expect(getProductDriveResources("LR7-72HVDF")?.datasheet?.label).toContain(
      "645-670"
    );
    expect(getProductDriveResources("LR7-72HVHF")?.datasheet?.label).toContain(
      "645-670"
    );
    expect(getProductPhotos("LR7-72HVD").length).toBe(4);
  });

  it("links Drive folders for 72HVH, LR8-66HVD, and renamed 54HVD", () => {
    expect(getProductDriveResources("LR7-72HVH")?.datasheet?.fileId).toBeTruthy();
    expect(getProductDriveResources("LR7-72HVH")?.photos.length).toBe(4);
    expect(getProductDriveResources("LR8-66HVD")?.datasheet?.fileId).toBeTruthy();
    expect(getProductDriveResources("LR8-66HYD")?.datasheet?.fileId).toBeTruthy();
    expect(getProductDriveResources("LR7-54HVDT")).toBeUndefined();
    expect(getProductDriveResources("LR7-54HVD")?.datasheet?.fileId).toBe(
      "1D0kKhIFFRzIZyp_lJk6u9yeAhdykXXkf"
    );
    expect(getProductDriveResources("LR7-54HVD")?.photos.length).toBe(4);
  });

  it("ships LR8-48 photos without requiring datasheet yet", () => {
    const hvh = getProductDriveResources("LR8-48HVH");
    const hvd = getProductDriveResources("LR8-48HVD");
    expect(hvh?.datasheet).toBeUndefined();
    expect(hvd?.datasheet).toBeUndefined();
    expect(getProductPhotos("LR8-48HVH").map((p) => p.label)).toEqual([
      "Front view",
      "Rear view",
      "Side view",
      "Bevel view",
    ]);
    expect(getProductPhotos("LR8-48HVD").length).toBe(4);
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
