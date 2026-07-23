import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith("/sign-in")) return true;
  if (pathname.startsWith("/sign-up")) return true;
  if (pathname === "/login") return true;
  if (pathname.startsWith("/__clerk")) return true;
  if (pathname === "/api/health") return true;
  return false;
}

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const secretKey = process.env.CLERK_SECRET_KEY;
const hasClerkKeys = Boolean(publishableKey && secretKey);

/**
 * If Clerk keys are missing on Vercel, return a clear 503 instead of a blank 500.
 * Check Production env in the Dashboard (do not use interactive `vercel env ls`).
 */
function missingClerkMiddleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/api/health") {
    return NextResponse.json({
      ok: false,
      clerk: {
        hasPublishableKey: Boolean(publishableKey),
        hasSecretKey: Boolean(secretKey),
        publishableKeyPrefix: publishableKey?.slice(0, 7) ?? null,
      },
    });
  }

  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"/><title>Clerk 未配置</title>
  <style>body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:24px}
  .card{max-width:34rem;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:24px;line-height:1.6}
  code{background:#0f172a;padding:2px 6px;border-radius:6px}</style></head><body><div class="card">
  <h1 style="margin-top:0">Clerk 环境变量未生效</h1>
  <p>正式站读不到 Clerk 密钥，所以无法显示邮箱登录。</p>
  <ul>
    <li>Publishable Key: <strong>${publishableKey ? "已检测到" : "缺失"}</strong></li>
    <li>Secret Key: <strong>${secretKey ? "已检测到" : "缺失"}</strong></li>
  </ul>
  <p>请到 Vercel → Settings → Environment Variables，确认 <strong>Production</strong> 下有：</p>
  <p><code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code><br/><code>CLERK_SECRET_KEY</code></p>
  <p>保存后点 <strong>Redeploy</strong>。也可打开 <code>/api/health</code> 查看检测结果。</p>
  </div></body></html>`;

  return new NextResponse(html, {
    status: 503,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

const withClerk = clerkMiddleware(async (auth, request: NextRequest) => {
  const { pathname } = request.nextUrl;
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  await auth.protect({
    unauthenticatedUrl: new URL("/sign-in", request.url).toString(),
  });
});

export default hasClerkKeys ? withClerk : missingClerkMiddleware;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
