/**
 * Types matching MongoDB/inventory-service JSON structure.
 * Used by mappers to transform into app types (Building, Space, Region).
 */
import type { Building, Space } from "./types";
import type { Region } from "@/components/FloorPlan";

export interface LocationDoc {
  _id?: { $oid?: string };
  name?: string;
  address?: string;
  address2?: string;
  city?: string;
  legalEntityName?: string;
  floorplanUrl?: string | null;
  floorPlanUrl?: string | null;
  floorPlanRegions?: Region[];
  geolocalization?: {
    type?: string;
    coordinates?: [number, number]; // [lng, lat]
  };
  images?: Array<{ url?: string; order?: number }>;
  nbOfOffices?: number;
  nbOfSuites?: number;
}

export interface OfficePoint {
  identifier?: string;
  x: number;
  y: number;
  path_ID?: number;
}

export interface OfficeDoc {
  _id?: { $oid?: string };
  locationId?: { $oid?: string };
  name?: string;
  floor?: number;
  seats?: number;
  squareFootage?: number;
  rentableSquareFootage?: number;
  officeNumber?: string;
  officeConfigurationType?: string;
  matterportImageUrl?: string | null;
  points?: OfficePoint[];
}

export interface InventoryData {
  buildings: Building[];
  spacesByLocationId: Record<string, Space[]>;
  regionsByLocationId: Record<string, Region[]>;
}

export type GetInventoryData = () => Promise<InventoryData>;
