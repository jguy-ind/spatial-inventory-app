import type { Region } from "@/components/FloorPlan";
import type { LocationDoc, OfficeDoc } from "@/lib/inventory-types";

export function mapToRegions(
  location: LocationDoc,
  offices: OfficeDoc[]
): Region[] {
  if (location.floorPlanRegions && location.floorPlanRegions.length > 0) {
    return location.floorPlanRegions;
  }

  return offices
    .filter((o) => o.points && o.points.length > 0)
    .map((office) => {
      const points = (office.points ?? [])
        .sort((a, b) => (a.path_ID ?? 0) - (b.path_ID ?? 0))
        .map((p) => ({ x: p.x, y: p.y }));
      return {
        id: office.name ?? office._id?.$oid ?? "",
        label: office.name ?? office.officeNumber ?? "",
        points,
      };
    });
}
