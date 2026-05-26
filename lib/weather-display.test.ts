import { describe, expect, it } from "vitest";
import {
  getWeatherLocation,
  getWeatherName,
  splitBilingualLabel,
} from "./weather-display";
import type { WeatherRecord } from "./pv-types";

describe("splitBilingualLabel", () => {
  it("splits Chinese + English station names", () => {
    expect(splitBilingualLabel("阿德莱德 Adelaide")).toEqual({
      zh: "阿德莱德",
      en: "Adelaide",
    });
  });

  it("returns English-only for Latin names", () => {
    expect(splitBilingualLabel("Sydney")).toEqual({ en: "Sydney" });
  });
});

describe("getWeatherName", () => {
  const bilingual: WeatherRecord = {
    id: "wx_test",
    name: "悉尼 Sydney",
    nameZh: "悉尼",
    nameEn: "Sydney",
    locationZh: "悉尼, 澳大利亚",
    locationEn: "Sydney, Australia",
    countryCode: "AUS",
    source: "epw",
  };

  it("returns Chinese only for zh locale", () => {
    expect(getWeatherName(bilingual, "zh")).toBe("悉尼");
    expect(getWeatherLocation(bilingual, "zh")).toBe("悉尼, 澳大利亚");
  });

  it("returns English only for en locale", () => {
    expect(getWeatherName(bilingual, "en")).toBe("Sydney");
    expect(getWeatherLocation(bilingual, "en")).toBe("Sydney, Australia");
  });

  it("falls back to heuristic split on legacy records", () => {
    const legacy: WeatherRecord = {
      id: "wx_legacy",
      name: "悉尼 Sydney",
      location: "悉尼 Sydney, 澳大利亚",
      source: "epw",
    };
    expect(getWeatherName(legacy, "zh")).toBe("悉尼");
    expect(getWeatherName(legacy, "en")).toBe("Sydney");
  });

  it("uses English EPW import without Chinese", () => {
    const imported: WeatherRecord = {
      id: "wx_imp",
      name: "Canberra",
      nameEn: "Canberra",
      locationEn: "Canberra, Australia",
      source: "epw",
    };
    expect(getWeatherName(imported, "en")).toBe("Canberra");
    expect(getWeatherName(imported, "zh")).toBe("Canberra");
  });
});
