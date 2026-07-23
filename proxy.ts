import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith("/sign-in")) return true;
  if (pathname.startsWith("/sign-up")) return true;
  if (pathname === "/login") return true;
  if (pathname.startsWith("/__clerk")) return true;
  return false;
}

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
const secretKey = process.env.CLERK_SECRET_KEY?.trim();

// clerkMiddleware dynamic secretKey requires an encryption key.
if (secretKey && !process.env.CLERK_ENCRYPTION_KEY?.trim()) {
  process.env.CLERK_ENCRYPTION_KEY = secretKey;
}

export default clerkMiddleware(
  async (auth, request: NextRequest) => {
    const { pathname } = request.nextUrl;

    if (isPublicPath(pathname)) {
      return NextResponse.next();
    }

    await auth.protect({
      unauthenticatedUrl: new URL("/sign-in", request.url).toString(),
    });
  },
  {
    publishableKey,
    secretKey,
  }
);

export const config = {
  // Exclude /api/health from Clerk entirely (diagnose Vercel env without auth crash).
  matcher: [
    "/((?!_next|api/health|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/__clerk/(.*)",
  ],
};
