import type { InventoryData } from "./inventory-types";
import { getMockInventoryData } from "./data-sources/mock-inventory";

export async function getInventoryData(): Promise<InventoryData> {
  return getMockInventoryData();
}
