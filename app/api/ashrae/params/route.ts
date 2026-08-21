import { NextResponse } from "next/server";
import {
  DEFAULT_ASHRAE_VERSION,
  isAshraeVersion,
  parseAshraeParams,
  type AshraeStation,
} from "@/lib/ashrae-meteo";

const ASHRAE_PARAMS =
  "https://ashrae-meteo.info/v3.0/request_meteo_parametres_get.php";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const wmo = (url.searchParams.get("wmo") ?? "").trim();
  const versionRaw = url.searchParams.get("version") ?? DEFAULT_ASHRAE_VERSION;
  const lat = Number(url.searchParams.get("lat"));
  const lon = Number(url.searchParams.get("lon"));
  const distanceKm = Number(url.searchParams.get("distanceKm") ?? 0);
  const place = url.searchParams.get("place") ?? "";

  if (!/^\d{4,8}$/.test(wmo)) {
    return NextResponse.json({ error: "wmo is required" }, { status: 400 });
  }
  if (!isAshraeVersion(versionRaw)) {
    return NextResponse.json({ error: "unsupported ASHRAE version" }, { status: 400 });
  }

  const upstream = new URL(ASHRAE_PARAMS);
  upstream.searchParams.set("wmo", wmo);
  upstream.searchParams.set("ashrae_version", versionRaw);
  upstream.searchParams.set("si_ip", "SI");

  const fallback: AshraeStation = {
    wmo,
    place,
    lat: Number.isFinite(lat) ? lat : 0,
    lon: Number.isFinite(lon) ? lon : 0,
    distanceKm: Number.isFinite(distanceKm) ? distanceKm : 0,
  };

  try {
    const res = await fetch(upstream, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `ASHRAE params request failed (${res.status})` },
        { status: 502 }
      );
    }
    const json = (await res.json()) as Parameters<typeof parseAshraeParams>[0];
    const params = parseAshraeParams(json, fallback, versionRaw);
    if (!params) {
      return NextResponse.json(
        { error: "Station has no extreme annual dry-bulb minimum" },
        { status: 404 }
      );
    }
    return NextResponse.json(params);
  } catch {
    return NextResponse.json(
      { error: "Unable to reach ASHRAE meteo" },
      { status: 502 }
    );
  }
}
