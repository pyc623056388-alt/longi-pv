const PLACEHOLDER_PREFIXES = ["pk_test_replace_me", "sk_test_replace_me"];

function cleaned(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (PLACEHOLDER_PREFIXES.some((p) => trimmed === p)) return undefined;
  return trimmed;
}

export function getClerkPublishableKey(): string | undefined {
  return cleaned(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

export function isClerkConfigured(): boolean {
  return Boolean(getClerkPublishableKey());
}

export function isClerkServerConfigured(): boolean {
  return Boolean(
    getClerkPublishableKey() && cleaned(process.env.CLERK_SECRET_KEY)
  );
}
