import type { InventoryData } from "./inventory-types";
import { getMockInventoryData } from "./data-sources/mock-inventory";
import {
  getPartnerApiInventoryData,
  getPartnerApiLocationsOnly,
  isPartnerApiConfigured,
} from "./data-sources/partner-api-inventory";

export async function getInventoryData(): Promise<InventoryData> {
  if (isPartnerApiConfigured()) {
    try {
      return await getPartnerApiInventoryData();
    } catch (err) {
      // Fall back to mock when Partner API fails (e.g. 404 locally, wrong env)
      console.warn("[inventory-data] Partner API failed, using mock data:", err);
      return getMockInventoryData();
    }
  }
  return getMockInventoryData();
}

/** Locations only (buildings, empty spaces/regions). Use when offices are loaded per location via API. */
export async function getLocationsOnly(): Promise<InventoryData> {
  if (!isPartnerApiConfigured()) {
    return getMockInventoryData();
  }
  try {
    return await getPartnerApiLocationsOnly();
  } catch (err) {
    console.warn("[inventory-data] getLocationsOnly failed, using mock data:", err);
    return getMockInventoryData();
  }
}
