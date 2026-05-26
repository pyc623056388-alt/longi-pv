import { describe, expect, it } from "vitest";
import {
  isPlausiblePmpTempCoef,
  parsePanFileContent,
} from "./panfile";

/** LR7-72HVH-640M.PAN 核心字段片段（PVsyst 7.x） */
const LR7_640M_SNIPPET = `
  Manufacturer=Longi Solar
  Model=LR7-72HVH-640M
  Width=1.134
  Height=2.382
  PNom=640.0
  Voc=54.0
  Isc=15.2
  Vmp=44.5
  Imp=14.4
  muPmpReq=-0.260
  Gamma=1.067
`;

const LR7_475M_SNIPPET = `
  Manufacturer=LONGi solar
  Model=LR7-54HVD-475M
  Width=1.134
  Height=1.800
  PNom=475.0
  Voc=40.42
  Isc=14.880
  Vmp=33.40
  Imp=14.230
  muPmpReq=-0.258
  RelEffic800=0.36
  RelEffic600=0.44
  RelEffic400=0.17
  RelEffic200=-1.58
  RSerie=0.153
  RShunt=350
`;

const GAMMA_ONLY_SNIPPET = `
  Manufacturer=Test
  Model=TestModule
  Width=1.0
  Height=2.0
  PNom=500.0
  Gamma=1.067
`;

describe("isPlausiblePmpTempCoef", () => {
  it("accepts typical negative %/°C values", () => {
    expect(isPlausiblePmpTempCoef(-0.26)).toBe(true);
    expect(isPlausiblePmpTempCoef(-0.29)).toBe(true);
  });

  it("rejects positive values like PVsyst Gamma", () => {
    expect(isPlausiblePmpTempCoef(1.067)).toBe(false);
  });

  it("rejects out-of-range magnitudes", () => {
    expect(isPlausiblePmpTempCoef(-2)).toBe(false);
    expect(isPlausiblePmpTempCoef(-0.001)).toBe(false);
  });
});

describe("parsePanFileContent", () => {
  it("reads muPmpReq from LR7 PAN and ignores Gamma", () => {
    const record = parsePanFileContent(LR7_640M_SNIPPET, "longi");
    expect(record).not.toBeNull();
    expect(record?.pmpTempCoef).toBe(-0.26);
    expect(record?.powerWp).toBe(640);
    expect(record?.lengthMm).toBe(2382);
    expect(record?.widthMm).toBe(1134);
  });

  it("leaves pmpTempCoef undefined when only Gamma is present", () => {
    const record = parsePanFileContent(GAMMA_ONLY_SNIPPET, "longi");
    expect(record).not.toBeNull();
    expect(record?.pmpTempCoef).toBeUndefined();
  });

  it("reads STC electrical parameters from PAN", () => {
    const record = parsePanFileContent(LR7_475M_SNIPPET, "longi");
    expect(record?.voc).toBe(40.42);
    expect(record?.isc).toBe(14.88);
    expect(record?.vmp).toBe(33.4);
    expect(record?.imp).toBe(14.23);
    expect(record?.powerWp).toBe(475);
  });

  it("reads RelEffic and Rs/Rsh from PAN", () => {
    const record = parsePanFileContent(LR7_475M_SNIPPET, "longi");
    expect(record?.lowLightRelEffic).toEqual({
      200: -1.58,
      400: 0.17,
      600: 0.44,
      800: 0.36,
    });
    expect(record?.rSerieOhm).toBe(0.153);
    expect(record?.rShuntOhm).toBe(350);
  });

  it("prefers muPmpReq over lower-priority keys", () => {
    const content = `
      Model=M
      Width=1
      Height=2
      PNom=100
      muPmpReq=-0.30
      muPmp=-0.35
      Gamma=1.05
    `;
    const record = parsePanFileContent(content, "longi");
    expect(record?.pmpTempCoef).toBe(-0.3);
  });
});
