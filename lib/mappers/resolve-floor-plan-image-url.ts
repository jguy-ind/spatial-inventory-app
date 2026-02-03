/**
 * Resolves floor plan image URL from location data.
 * Converts paths to file URLs; no fallback - returns empty string when unresolved.
 */
export function resolveFloorPlanImageUrl(
  url: string | null | undefined
): string {
  if (!url || typeof url !== "string") {
    return "";
  }
  const trimmed = url.trim();
  if (!trimmed) return "";

  // Remote URL (https://, http://) - return as-is
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Local path: ./public/<filename> → /<filename> (Next.js serves public at root)
  if (trimmed.startsWith("./public/")) {
    const filename = trimmed.slice("./public/".length);
    return filename ? `/${filename}` : "";
  }

  // Already a root path like /short-hills-floor-plan.png
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  return "";
}
