import { describe, expect, it } from "vitest";
import {
  haversineKm,
  parseAshraeParams,
  parseAshraePlaces,
  parseCoordinates,
} from "./ashrae-meteo";

const myrtleCreek = { lat: -29.09882721376321, lon: 153.04767769635268 };

describe("parseCoordinates", () => {
  it("parses lat, lon", () => {
    expect(parseCoordinates("-29.0988, 153.0477")).toEqual({
      lat: -29.0988,
      lon: 153.0477,
    });
  });

  it("rejects out-of-range values", () => {
    expect(parseCoordinates("99, 0")).toBeNull();
  });
});

describe("haversineKm", () => {
  it("places Casino about 24 km from Myrtle Creek", () => {
    const km = haversineKm(
      myrtleCreek.lat,
      myrtleCreek.lon,
      -28.878,
      153.052
    );
    expect(km).toBeGreaterThan(23);
    expect(km).toBeLessThan(26);
  });
});

describe("parseAshraePlaces", () => {
  it("sorts by distance and maps Casino first for Richmond Valley", () => {
    const stations = parseAshraePlaces(
      {
        meteo_stations: [
          {
            wmo: "945980",
            place: "EVANS HEAD, AUSTRALIA",
            lat: "-29.183",
            long: "153.396",
            elev: "63",
          },
          {
            wmo: "945730",
            place: "CASINO, AUSTRALIA",
            lat: "-28.878",
            long: "153.052",
            elev: "22",
          },
        ],
      },
      myrtleCreek.lat,
      myrtleCreek.lon
    );
    expect(stations[0]?.wmo).toBe("945730");
    expect(stations[0]?.place).toContain("CASINO");
  });
});

describe("parseAshraeParams", () => {
  it("reads dry-bulb mean min, not wet-bulb", () => {
    const parsed = parseAshraeParams(
      {
        meteo_stations: [
          {
            wmo: "945730",
            place: "CASINO, AUSTRALIA",
            lat: "-28.878",
            long: "153.052",
            elev: "22",
            period: "97-19",
            extreme_annual_DB_mean_min: "0.9",
            extreme_annual_WB_mean_min: "0.1",
          },
        ],
      },
      {
        wmo: "945730",
        place: "CASINO, AUSTRALIA",
        lat: -28.878,
        lon: 153.052,
        distanceKm: 24.5,
      },
      "2021"
    );
    expect(parsed?.extremeAnnualDbMeanMinC).toBe(0.9);
    expect(parsed?.extremeAnnualWbMeanMinC).toBe(0.1);
    expect(parsed?.period).toBe("97-19");
  });
});
