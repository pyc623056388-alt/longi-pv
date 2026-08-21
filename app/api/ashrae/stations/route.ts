import { NextResponse } from "next/server";
import {
  DEFAULT_ASHRAE_VERSION,
  isAshraeVersion,
  parseAshraePlaces,
} from "@/lib/ashrae-meteo";

const ASHRAE_PLACES =
  "https://ashrae-meteo.info/v3.0/request_places_get.php";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat"));
  const lon = Number(url.searchParams.get("lon"));
  const number = Math.min(
    20,
    Math.max(1, Number(url.searchParams.get("number") ?? 10) || 10)
  );
  const versionRaw = url.searchParams.get("version") ?? DEFAULT_ASHRAE_VERSION;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "lat and lon are required" }, { status: 400 });
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: "coordinates out of range" }, { status: 400 });
  }
  if (!isAshraeVersion(versionRaw)) {
    return NextResponse.json({ error: "unsupported ASHRAE version" }, { status: 400 });
  }

  const upstream = new URL(ASHRAE_PLACES);
  upstream.searchParams.set("lat", String(lat));
  upstream.searchParams.set("long", String(lon));
  upstream.searchParams.set("number", String(number));
  upstream.searchParams.set("ashrae_version", versionRaw);

  try {
    const res = await fetch(upstream, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `ASHRAE stations request failed (${res.status})` },
        { status: 502 }
      );
    }
    const json = (await res.json()) as Parameters<typeof parseAshraePlaces>[0];
    const stations = parseAshraePlaces(json, lat, lon);
    return NextResponse.json({ stations, version: versionRaw });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach ASHRAE meteo" },
      { status: 502 }
    );
  }
}
