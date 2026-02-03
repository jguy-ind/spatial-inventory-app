import type { Space } from "@/lib/types";
import type { OfficeDoc } from "@/lib/inventory-types";

const PLACEHOLDER_IMAGE = "/images/office-rep-2-interior.webp";

function getPositionFromPoints(points: OfficeDoc["points"]): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  if (!points || points.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return {
    x: minX,
    y: minY,
    width: maxX - minX || 1,
    height: maxY - minY || 1,
  };
}

export function mapOfficeToSpace(
  office: OfficeDoc,
  locationId: string
): Space {
  const id = office._id?.$oid ?? office.name ?? "";
  const now = new Date().toISOString();

  return {
    id,
    name: office.name ?? office.officeNumber ?? id,
    type: "office",
    status: "available",
    floor: office.floor ?? 1,
    building: locationId,
    capacity: office.seats ?? 0,
    sqft: office.squareFootage ?? office.rentableSquareFootage ?? 0,
    price: 0,
    amenities: [],
    position: getPositionFromPoints(office.points),
    images: [PLACEHOLDER_IMAGE],
    description: `Office ${office.name ?? id} at location.`,
    lastUpdated: now,
    windowType:
      office.officeConfigurationType?.toLowerCase().includes("window")
        ? "window"
        : "interior",
    matterportUrl: office.matterportImageUrl ?? undefined,
  };
}
