const TYPES = [
  { mime: "image/jpeg", matches: (bytes: Uint8Array) => bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  { mime: "image/png", matches: (bytes: Uint8Array) => bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 },
  {
    mime: "image/webp",
    matches: (bytes: Uint8Array) =>
      bytes.length >= 12 &&
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50,
  },
] as const;

export const MAX_IMAGE_BYTES = 4_000_000;

export function imageMime(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  return TYPES.find((type) => type.matches(bytes))?.mime ?? null;
}
