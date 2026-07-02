import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE_SEC,
  createSessionToken,
  isValidAccessCode,
  parseAccessCodes,
} from "@/lib/auth";

export async function POST(request: Request) {
  const secret = process.env.AUTH_SECRET;
  const allowed = parseAccessCodes(process.env.ACCESS_CODES);

  if (!secret || allowed.size === 0) {
    return NextResponse.json({ error: "config" }, { status: 500 });
  }

  let body: { code?: string };
  try {
    body = (await request.json()) as { code?: string };
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const code = body.code ?? "";
  if (!isValidAccessCode(code, allowed)) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  const token = await createSessionToken(secret);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SEC,
    path: "/",
  });
  return response;
}
