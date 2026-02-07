import { NextRequest } from "next/server";
import {
  partnerApiGet,
  isPartnerApiConfigured,
} from "@/lib/partner-api/client";
import type {
  PartnerApiOffice,
  PartnerApiOfficeListResponse,
  PartnerApiPriceEntry,
} from "@/lib/partner-api/types";

function extractOffices(res: PartnerApiOfficeListResponse) {
  if (Array.isArray(res)) return res;
  if (res.data && Array.isArray(res.data)) return res.data;
  if (res.offices && Array.isArray(res.offices)) return res.offices;
  return [];
}

/** Normalize single-office or list response to one office. */
function toSingleOffice(
  res: PartnerApiOffice | PartnerApiOfficeListResponse | { data?: PartnerApiOffice },
  officeId: string
): PartnerApiOffice | null {
  const unwrapped = res && typeof res === "object" && "data" in res && !Array.isArray((res as { data?: unknown }).data)
    ? (res as { data: PartnerApiOffice }).data
    : res;
  if (unwrapped && typeof unwrapped === "object" && "prices" in unwrapped) {
    const o = unwrapped as PartnerApiOffice;
    const id = o._id?.$oid ?? o.id ?? "";
    if (id === officeId || (o.name ?? "") === officeId) return o;
  }
  const arr = extractOffices(unwrapped as PartnerApiOfficeListResponse);
  const office = arr.find(
    (o) =>
      (o._id?.$oid ?? o.id ?? "") === officeId || (o.name ?? "") === officeId
  );
  return office ?? null;
}

/** Only used when Partner API is unconfigured (test placeholder). */
const termMultiplier = (term: number) =>
  Math.max(0, 1 - (term - 1) * 0.01);

/** In-memory cache for offices list so we don't call GET offices 85+ times when loading prices. */
const OFFICES_CACHE_TTL_MS = 60_000;
let officesCache: {
  data: PartnerApiOffice[];
  fetchedAt: number;
} | null = null;
let officesFetchPromise: Promise<PartnerApiOffice[]> | null = null;

async function getOfficesList(): Promise<PartnerApiOffice[]> {
  const now = Date.now();
  if (officesCache && now - officesCache.fetchedAt < OFFICES_CACHE_TTL_MS) {
    return officesCache.data;
  }
  if (officesFetchPromise) {
    return officesFetchPromise;
  }
  officesFetchPromise = (async () => {
    const res = await partnerApiGet<PartnerApiOfficeListResponse>("offices");
    const data = extractOffices(res);
    officesCache = { data, fetchedAt: Date.now() };
    officesFetchPromise = null;
    return data;
  })();
  return officesFetchPromise;
}

/**
 * Resolve price from office.prices where termLength >= termFrom && termLength < termTo.
 * Falls back to List price if no Range matches, then to 0.
 */
function resolvePriceFromPrices(
  prices: PartnerApiPriceEntry[] | undefined,
  termLength: number
): number | null {
  if (!prices?.length) return null;

  const active = prices.filter((p) => p.isActive !== false);

  const rangeMatch = active.find(
    (p) => {
      if (p.priceType !== "Range" || !("termFrom" in p) || !("termTo" in p))
        return false;
      const from = (p as { termFrom: number }).termFrom;
      const to = (p as { termTo: number }).termTo;
      if (termLength >= from && termLength < to) return true;
      if (from === to && termLength === from) return true;
      return false;
    }
  );
  if (rangeMatch && typeof (rangeMatch as { price?: number }).price === "number") {
    return (rangeMatch as { price: number }).price;
  }

  const listPrice = active.find(
    (p) => p.priceType === "List" && typeof (p as { price?: number }).price === "number"
  ) as { price: number } | undefined;
  if (listPrice) return listPrice.price;

  return null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: officeId } = await context.params;
  const termParam = request.nextUrl.searchParams.get("term");
  const term = termParam ? Math.max(1, parseInt(termParam, 10) || 1) : 24;

  const fullRequestUrl = request.url;
  const baseUrl = fullRequestUrl.replace(request.nextUrl.pathname + request.nextUrl.search, "");
  const fullEndpoint = request.nextUrl.pathname + request.nextUrl.search;
  const reqLog = {
    method: request.method,
    baseUrl,
    fullEndpoint,
    fullRequestUrl,
    officeId,
    term,
    termParam: request.nextUrl.searchParams.get("term"),
  };
  console.log("[pricing] Request (entire):", JSON.stringify(reqLog, null, 2));

  if (!officeId) {
    const resBody = { error: "Missing office id" };
    console.log("[pricing] Response (full):", JSON.stringify({ status: 400, body: resBody }, null, 2));
    return Response.json(resBody, { status: 400 });
  }

  const partnerConfigured = isPartnerApiConfigured();

  if (!partnerConfigured) {
    // Test: return a placeholder so drawer shows non-zero when testing without Partner API
    const testPrice = Math.round(3200 * termMultiplier(term));
    const resBody = { price: testPrice, basePrice: 3200, term, source: "unconfigured" as const };
    console.log("[pricing] Response (full):", JSON.stringify({ status: 200, body: resBody }, null, 2));
    return Response.json(resBody, { status: 200 });
  }

  try {
    // Partner API has no GET offices/{id} (returns 404). Use GET offices (list) and find by id.
    const offices = await getOfficesList();
    const office =
      offices.find(
        (o) =>
          (o._id?.$oid ?? o.id ?? "") === officeId || (o.name ?? "") === officeId
      ) ?? null;
    if (!office) {
      console.warn("[pricing] Office not found in list:", officeId);
    }

    const resolved =
      office?.prices && Array.isArray(office.prices)
        ? resolvePriceFromPrices(office.prices, term)
        : null;

    const price =
      resolved !== null && resolved > 0
        ? Math.round(resolved)
        : 0;

    const resBody = { price, term };
    console.log("[pricing] Response (full):", JSON.stringify({ status: 200, body: resBody }, null, 2));
    return Response.json(resBody);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[pricing] Partner API error:", message);
    // Return 200 with price 0 so UI shows $0; include error for debugging in Network tab
    const resBody = { price: 0, term, error: message };
    return Response.json(resBody, { status: 200 });
  }
}
