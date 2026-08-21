import { describe, expect, it } from "vitest";
import { recordFromPanContent } from "./string-calculator-pan-import";

const LONGI_PAN = `
  Manufacturer=LONGi solar
  Model=LR7-72HVD-650M
  Width=1.134
  Height=2.382
  PNom=650.0
  Voc=54.22
  Isc=15.140
  Vmp=44.87
  Imp=14.490
  muVocSpec=-118.0
  muPmpReq=-0.272
`;

const JINKO_PAN = `
  Manufacturer=Jinko Solar
  Model=JKM630N-78HL4-BDV
  Width=1.134
  Height=2.465
  PNom=630.0
  Voc=55.54
  Isc=14.31
  Vmp=46.64
  Imp=13.51
  muVocSpec=-140.0
  muPmpReq=-0.29
`;

describe("recordFromPanContent", () => {
  it("imports a LONGi PAN into the longi library with Voc temp coef", () => {
    const rec = recordFromPanContent(LONGI_PAN);
    expect(rec).not.toBeNull();
    expect(rec?.library).toBe("longi");
    expect(rec?.model).toBe("LR7-72HVD-650M");
    expect(rec?.voc).toBe(54.22);
    expect(rec?.vocTempCoefPct).toBeCloseTo(-0.2176, 3);
    expect(rec?.id).toContain("mod_longi_");
    expect(rec?.catalogHidden).toBe(false);
  });

  it("imports a non-LONGi PAN into the competitor library", () => {
    const rec = recordFromPanContent(JINKO_PAN);
    expect(rec?.library).toBe("competitor");
    expect(rec?.id).toContain("mod_competitor_");
    expect(rec?.vocTempCoefPct).toBeCloseTo(-0.2521, 3);
  });
});
