/**
 * Partner API response DTOs (v1.1.0).
 * Align with Swagger: Location, Office, LocationListResponse, OfficeListResponse.
 */

export interface PartnerApiLocation {
  _id?: { $oid?: string };
  id?: string;
  name?: string;
  address?: string;
  address2?: string;
  city?: string;
  legalEntityName?: string;
  floorplanUrl?: string | null;
  floorPlanUrl?: string | null;
  geolocalization?: {
    type?: string;
    coordinates?: [number, number];
  };
  images?: Array<{ url?: string; order?: number }>;
  nbOfOffices?: number;
  nbOfSuites?: number;
}

export interface PartnerApiLocationListResponse {
  data?: PartnerApiLocation[];
  locations?: PartnerApiLocation[];
}

export interface PartnerApiOfficePoint {
  identifier?: string;
  x: number;
  y: number;
  path_ID?: number;
}

/** List price (no term range). */
export interface PartnerApiPriceList {
  priceType: "List";
  price: number;
  priceFloor?: number;
  isActive?: boolean;
}

/** Term range price (termFrom/termTo in months). */
export interface PartnerApiPriceRange {
  priceType: "Range";
  termFrom: number;
  termTo: number;
  price: number;
  priceFloor?: number;
  isActive?: boolean;
}

export type PartnerApiPriceEntry =
  | PartnerApiPriceList
  | PartnerApiPriceRange;

export interface PartnerApiOffice {
  _id?: { $oid?: string };
  id?: string;
  locationId?: { $oid?: string };
  name?: string;
  floor?: number;
  seats?: number;
  squareFootage?: number;
  rentableSquareFootage?: number;
  officeNumber?: string;
  officeConfigurationType?: string;
  matterportImageUrl?: string | null;
  productSfId?: string;
  productId?: string;
  points?: PartnerApiOfficePoint[];
  tier?: number;
  updatedAt?: { $date?: string } | string;
  prices?: PartnerApiPriceEntry[];
}

export interface PartnerApiOfficeListResponse {
  data?: PartnerApiOffice[];
  offices?: PartnerApiOffice[];
}

/** Enrichment from SMS / subscription data for an office. */
export interface OfficeOccupancyEnrichment {
  status?: "available" | "occupied" | "pending" | "maintenance";
  occupiedBy?: string;
  moveOutDate?: string;
  accountId?: string;
  occupancyStartDate?: string;
  occupancyEndDate?: string;
}
