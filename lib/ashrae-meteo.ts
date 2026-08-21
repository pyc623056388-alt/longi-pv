export const ASHRAE_METEO_HOME = "https://ashrae-meteo.info/v3.0/";
export const ASHRAE_VERSIONS = ["2017", "2021", "2025"] as const;
export type AshraeVersion = (typeof ASHRAE_VERSIONS)[number];
export const DEFAULT_ASHRAE_VERSION: AshraeVersion = "2021";

export interface AshraeStation {
  wmo: string;
  place: string;
  lat: number;
  lon: number;
  elevM?: number;
  distanceKm: number;
}

export interface AshraeStationParams {
  station: AshraeStation;
  period?: string;
  timeZone?: string;
  /** Extreme Annual Mean Minimum Dry Bulb Temperature, °C */
  extremeAnnualDbMeanMinC: number;
  /** Kept only to warn against mixing with dry-bulb. */
  extremeAnnualWbMeanMinC?: number;
  ashraeVersion: AshraeVersion;
  sourceUrl: string;
}

interface PlacesJson {
  meteo_stations?: Array<{
    wmo?: string;
    place?: string;
    lat?: string;
    long?: string;
    elev?: string;
  }>;
}

interface ParamsJson {
  meteo_stations?: Array<{
    wmo?: string;
    place?: string;
    lat?: string;
    long?: string;
    elev?: string;
    period?: string;
    time_zone?: string;
    extreme_annual_DB_mean_min?: string;
    extreme_annual_WB_mean_min?: string;
  }>;
}

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const r = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(a)));
}

function parseNum(value: string | number | undefined): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : undefined;
}

export function parseAshraePlaces(
  json: PlacesJson,
  siteLat: number,
  siteLon: number
): AshraeStation[] {
  const stations: AshraeStation[] = [];
  for (const row of json.meteo_stations ?? []) {
    const lat = parseNum(row.lat);
    const lon = parseNum(row.long);
    const wmo = (row.wmo ?? "").trim();
    const place = (row.place ?? "").trim();
    if (!wmo || !place || lat == null || lon == null) continue;
    const elevM = parseNum(row.elev);
    stations.push({
      wmo,
      place,
      lat,
      lon,
      ...(elevM != null ? { elevM } : {}),
      distanceKm: haversineKm(siteLat, siteLon, lat, lon),
    });
  }
  return stations.sort((a, b) => a.distanceKm - b.distanceKm);
}

export function parseAshraeParams(
  json: ParamsJson,
  fallback: AshraeStation,
  ashraeVersion: AshraeVersion
): AshraeStationParams | null {
  const row = json.meteo_stations?.[0];
  if (!row) return null;
  const tmin = parseNum(row.extreme_annual_DB_mean_min);
  if (tmin == null) return null;
  const lat = parseNum(row.lat) ?? fallback.lat;
  const lon = parseNum(row.long) ?? fallback.lon;
  const station: AshraeStation = {
    wmo: (row.wmo ?? fallback.wmo).trim(),
    place: (row.place ?? fallback.place).trim(),
    lat,
    lon,
    elevM: parseNum(row.elev) ?? fallback.elevM,
    distanceKm: fallback.distanceKm,
  };
  return {
    station,
    period: row.period?.trim() || undefined,
    timeZone: row.time_zone?.trim() || undefined,
    extremeAnnualDbMeanMinC: tmin,
    extremeAnnualWbMeanMinC: parseNum(row.extreme_annual_WB_mean_min),
    ashraeVersion,
    sourceUrl: ASHRAE_METEO_HOME,
  };
}

export function isAshraeVersion(value: string): value is AshraeVersion {
  return (ASHRAE_VERSIONS as readonly string[]).includes(value);
}

export function parseCoordinates(
  text: string
): { lat: number; lon: number } | null {
  const m = text
    .trim()
    .match(/^(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)$/);
  if (!m) return null;
  const lat = parseFloat(m[1]!);
  const lon = parseFloat(m[2]!);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
}

export function formatCoordinates(lat: number, lon: number): string {
  return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
}

export function formatDistanceKm(km: number): string {
  if (!Number.isFinite(km)) return "—";
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}
