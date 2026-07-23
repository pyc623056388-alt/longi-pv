import { NextResponse } from "next/server";

/** Non-secret health check for Vercel env wiring (no vercel CLI needed). */
export async function GET() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;

  return NextResponse.json({
    ok: Boolean(publishableKey && secretKey),
    clerk: {
      hasPublishableKey: Boolean(publishableKey),
      hasSecretKey: Boolean(secretKey),
      publishableKeyPrefix: publishableKey?.slice(0, 7) ?? null,
    },
  });
}
