/**
 * Normalize image URL for production/development environments
 *
 * Handles:
 * - Localhost URLs → Convert to relative paths
 * - Relative paths → Keep as-is
 * - Absolute URLs → Keep as-is
 * - Plain filenames → Prefix with /uploads/
 */
export function normalizeImageUrl(url: string | undefined | null): string {
  if (!url) return "";

  // Already a relative path - keep as-is
  if (url.startsWith("/")) return url;

  // Localhost URL - extract pathname only
  if (url.includes("localhost:")) {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname; // /uploads/filename.png
    } catch {
      // Invalid URL, return empty
      return "";
    }
  }

  // External URL (http:// or https://) - keep as-is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Plain filename - prefix with /uploads/
  return `/uploads/${url}`;
}

/**
 * Normalize array of image URLs
 */
export function normalizeImageUrls(
  urls: (string | undefined | null)[],
): string[] {
  return urls.map(normalizeImageUrl).filter(Boolean);
}
