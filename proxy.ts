import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith("/sign-in")) return true;
  if (pathname.startsWith("/sign-up")) return true;
  if (pathname === "/login") return true; // legacy bookmark → page redirects
  if (pathname.startsWith("/__clerk")) return true;
  return false;
}

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  await auth.protect({
    unauthenticatedUrl: new URL("/sign-in", request.url).toString(),
  });
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
