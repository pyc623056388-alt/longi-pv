import { redirect } from "next/navigation";

/** Legacy invite-code login URL → Clerk sign-in */
export default async function LegacyLoginRedirect({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const target = params.redirect?.startsWith("/")
    ? `/sign-in?redirect_url=${encodeURIComponent(params.redirect)}`
    : "/sign-in";
  redirect(target);
}
