/**
 * Normalize external image URLs so they work as <img src> on the storefront.
 * Google Drive share links must be converted to a direct view URL.
 */
export function normalizeExternalImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  const fileIdFromPath = trimmed.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i)?.[1];
  if (fileIdFromPath) {
    return `https://drive.google.com/uc?export=view&id=${fileIdFromPath}`;
  }

  const fileIdFromOpen = trimmed.match(/[?&]id=([^&]+)/i)?.[1];
  if (/drive\.google\.com/i.test(trimmed) && fileIdFromOpen) {
    return `https://drive.google.com/uc?export=view&id=${fileIdFromOpen}`;
  }

  return trimmed;
}
