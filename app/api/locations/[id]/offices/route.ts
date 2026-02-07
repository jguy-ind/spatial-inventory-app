import { isPartnerApiConfigured } from "@/lib/partner-api/client";
import { getOfficesForLocation } from "@/lib/data-sources/partner-api-inventory";

/**
 * GET /api/locations/[id]/offices
 * Returns { spaces, regions } for the given location id (building id).
 * Only used when Partner API is configured; otherwise returns 404.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: locationId } = await context.params;
  if (!locationId) {
    return Response.json({ error: "Missing location id" }, { status: 400 });
  }
  if (!isPartnerApiConfigured()) {
    return Response.json({ error: "Partner API not configured" }, { status: 404 });
  }
  try {
    const { spaces, regions } = await getOfficesForLocation(locationId);
    return Response.json({ spaces, regions });
  } catch (err) {
    console.error("[locations/offices] Failed to fetch offices for location:", locationId, err);
    return Response.json(
      { error: "Failed to fetch offices for location" },
      { status: 500 }
    );
  }
}
