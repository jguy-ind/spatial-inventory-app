import type { InventoryData } from "./inventory-types";
import { getMockInventoryData } from "./data-sources/mock-inventory";
import {
  getPartnerApiInventoryData,
  isPartnerApiConfigured,
} from "./data-sources/partner-api-inventory";

export async function getInventoryData(): Promise<InventoryData> {
  if (isPartnerApiConfigured()) {
    return getPartnerApiInventoryData();
  }
  return getMockInventoryData();
}
