export const STRING_LETTER_IMAGE_FILES = {
  logo: "logo.png",
  asNzs5033: "as-nzs-5033-4.2.1.3.1b.png",
  iecNote1: "iec-62548-f1.1-note1.png",
} as const;

export type LetterPng = {
  data: Uint8Array;
  width: number;
  height: number;
};

function pngSize(data: Uint8Array): { width: number; height: number } {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

async function readPublicPng(fileName: string): Promise<Uint8Array | null> {
  if (typeof window === "undefined") {
    const fs = await import("fs");
    const path = await import("path");
    const full = path.join(process.cwd(), "public", "string-letter", fileName);
    if (!fs.existsSync(full)) return null;
    return new Uint8Array(fs.readFileSync(full));
  }
  const res = await fetch(`/string-letter/${fileName}`);
  if (!res.ok) return null;
  return new Uint8Array(await res.arrayBuffer());
}

export async function loadLetterPng(
  key: keyof typeof STRING_LETTER_IMAGE_FILES
): Promise<LetterPng | null> {
  const data = await readPublicPng(STRING_LETTER_IMAGE_FILES[key]);
  if (!data || data.length < 24) return null;
  const size = pngSize(data);
  if (!(size.width > 0) || !(size.height > 0)) return null;
  return { data, ...size };
}

export function scaleToWidth(
  width: number,
  height: number,
  maxWidth: number
): { width: number; height: number } {
  if (width <= maxWidth) return { width, height };
  return {
    width: maxWidth,
    height: Math.max(1, Math.round((height * maxWidth) / width)),
  };
}
