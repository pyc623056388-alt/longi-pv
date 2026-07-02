export const AUTH_COOKIE_NAME = "longi-auth";
export const SESSION_MAX_AGE_SEC = 30 * 24 * 60 * 60;

type SessionPayload = {
  exp: number;
};

function textEncoder(): TextEncoder {
  return new TextEncoder();
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array | null {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (padded.length % 4)) % 4;
    const base64 = padded + "=".repeat(padLen);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    textEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export function parseAccessCodes(raw: string | undefined): Set<string> {
  if (!raw?.trim()) return new Set();
  return new Set(
    raw
      .split(",")
      .map((code) => code.trim().toUpperCase())
      .filter(Boolean)
  );
}

export function isValidAccessCode(code: string, allowed: Set<string>): boolean {
  if (!code.trim() || allowed.size === 0) return false;
  return allowed.has(code.trim().toUpperCase());
}

export async function createSessionToken(secret: string): Promise<string> {
  const payload: SessionPayload = {
    exp: Date.now() + SESSION_MAX_AGE_SEC * 1000,
  };
  const payloadJson = JSON.stringify(payload);
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder().encode(payloadJson)
  );
  return `${toBase64Url(textEncoder().encode(payloadJson))}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(
  token: string,
  secret: string
): Promise<boolean> {
  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) return false;

  const payloadBytes = fromBase64Url(payloadPart);
  const signatureBytes = fromBase64Url(signaturePart);
  if (!payloadBytes || !signatureBytes) return false;

  let payloadJson: string;
  try {
    payloadJson = new TextDecoder().decode(payloadBytes);
  } catch {
    return false;
  }

  let payload: SessionPayload;
  try {
    payload = JSON.parse(payloadJson) as SessionPayload;
  } catch {
    return false;
  }

  if (typeof payload.exp !== "number" || payload.exp <= Date.now()) {
    return false;
  }

  const key = await importHmacKey(secret);
  return crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    textEncoder().encode(payloadJson)
  );
}
