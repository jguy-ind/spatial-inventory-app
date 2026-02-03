import { NextRequest } from "next/server";
import {
  partnerApiGet,
  isPartnerApiConfigured,
} from "@/lib/partner-api/client";
import type {
  PartnerApiOfficeListResponse,
  PartnerApiPriceEntry,
} from "@/lib/partner-api/types";

function extractOffices(res: PartnerApiOfficeListResponse) {
  if (Array.isArray(res)) return res;
  if (res.data && Array.isArray(res.data)) return res.data;
  if (res.offices && Array.isArray(res.offices)) return res.offices;
  return [];
}

/** Only used when Partner API is unconfigured (test placeholder). */
const termMultiplier = (term: number) =>
  Math.max(0, 1 - (term - 1) * 0.01);

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

  const reqLog = {
    method: request.method,
    url: request.url,
    officeId,
    term,
    termParam: request.nextUrl.searchParams.get("term"),
  };
  console.log("[pricing] Request (full):", JSON.stringify(reqLog, null, 2));

  if (!officeId) {
    const resBody = { error: "Missing office id" };
    console.log("[pricing] Response (full):", JSON.stringify({ status: 400, body: resBody }, null, 2));
    return Response.json(resBody, { status: 400 });
  }

  if (!isPartnerApiConfigured()) {
    // Test: return a placeholder so drawer shows non-zero when testing without Partner API
    const testPrice = Math.round(3200 * termMultiplier(term));
    const resBody = { price: testPrice, basePrice: 3200, term, source: "unconfigured" as const };
    console.log("[pricing] Response (full):", JSON.stringify({ status: 200, body: resBody }, null, 2));
    return Response.json(resBody, { status: 200 });
  }

  try {
    const res = await partnerApiGet<PartnerApiOfficeListResponse>("offices");
    const offices = extractOffices(res);
    const office = offices.find(
      (o) =>
        (o._id?.$oid ?? o.id ?? "") === officeId ||
        (o.name ?? "") === officeId
    );

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
    console.error("[pricing] Partner API error:", err);
    const resBody = { error: "Failed to fetch price", price: 0 };
    console.log("[pricing] Response (full, error):", JSON.stringify({ status: 200, body: resBody }, null, 2));
    return Response.json(resBody, { status: 200 });
  }
}
