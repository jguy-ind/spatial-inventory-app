import type { LocationDoc, OfficeDoc, InventoryData } from "@/lib/inventory-types";
import type { Space } from "@/lib/types";
import type { Region } from "@/components/FloorPlan";
import { mapLocationToBuilding } from "@/lib/mappers/map-location-to-building";
import { mapOfficeToSpace } from "@/lib/mappers/map-office-to-space";
import { mapToRegions } from "@/lib/mappers/map-to-regions";
import { partnerApiGet, isPartnerApiConfigured } from "@/lib/partner-api/client";
import type {
  PartnerApiLocation,
  PartnerApiLocationListResponse,
  PartnerApiOffice,
  PartnerApiOfficeListResponse,
  OfficeOccupancyEnrichment,
} from "@/lib/partner-api/types";

function getLocationId(doc: { locationId?: { $oid?: string } | string }): string {
  const loc = doc.locationId;
  if (typeof loc === "string") return loc;
  return loc?.$oid ?? "";
}

function getDocId(doc: { _id?: { $oid?: string }; id?: string }): string {
  const id = doc._id?.$oid ?? doc.id;
  return typeof id === "string" ? id : "";
}

function normalizePartnerLocation(api: PartnerApiLocation): LocationDoc {
  const id = api._id?.$oid ?? api.id ?? "";
  return {
    _id: { $oid: typeof id === "string" ? id : String(id) },
    name: api.name,
    address: api.address,
    address2: api.address2,
    city: api.city,
    legalEntityName: api.legalEntityName,
    floorplanUrl: api.floorplanUrl ?? api.floorPlanUrl ?? null,
    floorPlanUrl: api.floorPlanUrl ?? api.floorplanUrl ?? null,
    geolocalization: api.geolocalization,
    images: api.images,
    nbOfOffices: api.nbOfOffices,
    nbOfSuites: api.nbOfSuites,
  };
}

function normalizePartnerOffice(api: PartnerApiOffice): OfficeDoc & { productSfId?: string } {
  const id = api._id?.$oid ?? api.id ?? "";
  const locationId = api.locationId?.$oid ?? (typeof (api as unknown as { locationId?: string }).locationId === "string" ? (api as unknown as { locationId: string }).locationId : "");
  return {
    _id: { $oid: typeof id === "string" ? id : String(id) },
    locationId: locationId ? { $oid: locationId } : undefined,
    name: api.name,
    floor: api.floor,
    seats: api.seats,
    squareFootage: api.squareFootage,
    rentableSquareFootage: api.rentableSquareFootage,
    officeNumber: api.officeNumber,
    officeConfigurationType: api.officeConfigurationType,
    matterportImageUrl: api.matterportImageUrl ?? null,
    points: api.points,
    productSfId: api.productSfId ?? api.productId,
  } as OfficeDoc & { productSfId?: string };
}

function extractLocations(res: PartnerApiLocationListResponse): PartnerApiLocation[] {
  if (Array.isArray(res)) return res as PartnerApiLocation[];
  if (res.data && Array.isArray(res.data)) return res.data;
  if (res.locations && Array.isArray(res.locations)) return res.locations;
  return [];
}

function extractOffices(res: PartnerApiOfficeListResponse): PartnerApiOffice[] {
  if (Array.isArray(res)) return res as PartnerApiOffice[];
  if (res.data && Array.isArray(res.data)) return res.data;
  if (res.offices && Array.isArray(res.offices)) return res.offices;
  return [];
}

/** Build enrichment map by office id (and optionally product id). SMS endpoint TBD. */
async function fetchOccupancyEnrichment(
  _officeIds: string[],
  _productIds: string[]
): Promise<Record<string, OfficeOccupancyEnrichment>> {
  const map: Record<string, OfficeOccupancyEnrichment> = {};
  // When Partner API exposes subscription/account endpoints, fetch and fill map.
  // For now leave empty so all offices show as available from inventory.
  return map;
}

export async function getPartnerApiInventoryData(): Promise<InventoryData> {
  const [locationsRes, officesRes] = await Promise.all([
    partnerApiGet<PartnerApiLocationListResponse>("locations"),
    partnerApiGet<PartnerApiOfficeListResponse>("offices"),
  ]);

  const apiLocations = extractLocations(locationsRes);
  const apiOffices = extractOffices(officesRes);

  const locations: LocationDoc[] = apiLocations.map(normalizePartnerLocation);
  const offices: (OfficeDoc & { productSfId?: string })[] = apiOffices.map(normalizePartnerOffice);

  const officeIds = offices.map((o) => o._id?.$oid ?? o.name ?? "");
  const productIds = offices.map((o) => (o as { productSfId?: string }).productSfId).filter(Boolean) as string[];
  const enrichmentByOfficeId = await fetchOccupancyEnrichment(officeIds, productIds);

  const buildings = locations.map(mapLocationToBuilding);
  const spacesByLocationId: Record<string, Space[]> = {};
  const regionsByLocationId: Record<string, Region[]> = {};

  for (const loc of locations) {
    const locationId = getDocId(loc);
    const locationOffices = offices.filter((o) => getLocationId(o) === locationId);
    const officeDocs: OfficeDoc[] = locationOffices.map((o) => {
      const { productSfId: _, ...doc } = o;
      return doc;
    });
    spacesByLocationId[locationId] = locationOffices.map((o) => {
      const officeId = o._id?.$oid ?? o.name ?? "";
      const enrichment = enrichmentByOfficeId[officeId];
      return mapOfficeToSpace(o, locationId, enrichment);
    });
    regionsByLocationId[locationId] = mapToRegions(loc, officeDocs);
  }

  return {
    buildings,
    spacesByLocationId,
    regionsByLocationId,
  };
}

export { isPartnerApiConfigured };
