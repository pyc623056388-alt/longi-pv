import { describe, expect, it } from "vitest";
import { getProductDriveResources } from "./product-drive-resources";

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
    expect(getProductDriveResources("LR7-60HVHL")?.installationManual).toBeTruthy();
    expect(getProductDriveResources("LR7-72HVD")?.warranty).toBeTruthy();
  });
});
