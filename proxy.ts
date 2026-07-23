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

// Strip accidental whitespace from Vercel Dashboard pastes (do not pass
// secretKey as clerkMiddleware options — that requires a separate encryption key).
if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.trim();
}
if (process.env.CLERK_SECRET_KEY) {
  process.env.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY.trim();
}

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|api/health|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/__clerk/(.*)",
  ],
};
