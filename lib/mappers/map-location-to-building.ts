import type { Building } from "@/lib/types";
import type { LocationDoc } from "@/lib/inventory-types";
import { resolveFloorPlanImageUrl } from "./resolve-floor-plan-image-url";

export function mapLocationToBuilding(loc: LocationDoc): Building {
  const id = loc._id?.$oid ?? "";
  const coords = loc.geolocalization?.coordinates;
  const lat = coords?.[1] ?? 0;
  const lng = coords?.[0] ?? 0;

  const name =
    loc.name && loc.address
      ? `${loc.name} - ${loc.address}`
      : loc.legalEntityName ?? loc.name ?? loc.address ?? "Unknown";

  const totalSpaces = (loc.nbOfOffices ?? 0) + (loc.nbOfSuites ?? 0);

  return {
    id,
    name,
    address: loc.address ?? "",
    city: loc.city ?? "",
    floors: 1,
    totalSpaces: totalSpaces || 1,
    availableSpaces: totalSpaces || 1,
    coordinates: { lat, lng },
    image: resolveFloorPlanImageUrl(loc.floorplanUrl ?? loc.floorPlanUrl),
  };
}
