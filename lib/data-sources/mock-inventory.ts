import type { LocationDoc, OfficeDoc, InventoryData } from "@/lib/inventory-types";
import type { Space } from "@/lib/types";
import type { Region } from "@/components/FloorPlan";
import { mapLocationToBuilding } from "@/lib/mappers/map-location-to-building";
import { mapOfficeToSpace } from "@/lib/mappers/map-office-to-space";
import { mapToRegions } from "@/lib/mappers/map-to-regions";

import locationsJson from "@/inventory-service-prod.locations.json";
import officesJson from "@/inventory-service-prod.offices.json";

const locations = locationsJson as LocationDoc[];
const offices = officesJson as OfficeDoc[];

function getLocationId(doc: { locationId?: { $oid?: string } }): string {
  return doc.locationId?.$oid ?? "";
}

function getDocId(doc: { _id?: { $oid?: string } }): string {
  return doc._id?.$oid ?? "";
}

export async function getMockInventoryData(): Promise<InventoryData> {
  const buildings = locations.map(mapLocationToBuilding);
  const spacesByLocationId: Record<string, Space[]> = {};
  const regionsByLocationId: Record<string, Region[]> = {};

  for (const loc of locations) {
    const locationId = getDocId(loc);
    const locationOffices = offices.filter(
      (o) => getLocationId(o) === locationId
    );
    spacesByLocationId[locationId] = locationOffices.map((o) =>
      mapOfficeToSpace(o, locationId)
    );
    regionsByLocationId[locationId] = mapToRegions(loc, locationOffices);
  }

  return {
    buildings,
    spacesByLocationId,
    regionsByLocationId,
  };
}
