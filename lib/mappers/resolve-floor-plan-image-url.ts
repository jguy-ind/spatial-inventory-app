/**
 * Resolves floor plan image URL from location data.
 * Handles local paths (./public/...) and future remote URLs (CDN/git link).
 */
const FALLBACK_FLOOR_PLAN = "/short-hills-floor-plan.png";

export function resolveFloorPlanImageUrl(
  url: string | null | undefined
): string {
  if (!url || typeof url !== "string") {
    return FALLBACK_FLOOR_PLAN;
  }
  const trimmed = url.trim();
  if (!trimmed) return FALLBACK_FLOOR_PLAN;

  // Remote URL (https://, http://) - return as-is
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Local path: ./public/short_hills_floorplan.png or ./public/... → /short-hills-floor-plan.png
  if (trimmed.startsWith("./public/") || trimmed.includes("short_hills") || trimmed.includes("short-hills")) {
    return FALLBACK_FLOOR_PLAN;
  }

  // Already a root path like /short-hills-floor-plan.png
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  return FALLBACK_FLOOR_PLAN;
}
