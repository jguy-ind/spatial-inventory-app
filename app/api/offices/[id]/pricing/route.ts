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

  // #region agent log
  const _logPayload = {
    location: "pricing/route.ts:GET-entry",
    message: "Received officeId (H1/H3: id format or trailing char)",
    data: {
      officeId,
      officeIdLength: officeId?.length,
      lastChar: officeId ? officeId.slice(-1) : null,
      lastCharCode: officeId ? officeId.charCodeAt(officeId.length - 1) : null,
    },
    timestamp: Date.now(),
    sessionId: "debug-session",
    hypothesisId: "H1_H3",
  };
  await fetch("http://127.0.0.1:7242/ingest/9011e2dd-5deb-4901-a951-608c0365dbf2", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(_logPayload),
  }).catch(() => {});
  // #endregion

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
  // #region agent log
  await fetch("http://127.0.0.1:7242/ingest/9011e2dd-5deb-4901-a951-608c0365dbf2", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "pricing/route.ts:partner-config-check",
      message: "Partner API config (mock = unconfigured)",
      data: { isPartnerApiConfigured: partnerConfigured, officeId, term },
      timestamp: Date.now(),
      sessionId: "debug-session",
      hypothesisId: "MOCK",
    }),
  }).catch(() => {});
  // #endregion

  if (!partnerConfigured) {
    // Test: return a placeholder so drawer shows non-zero when testing without Partner API
    const testPrice = Math.round(3200 * termMultiplier(term));
    const resBody = { price: testPrice, basePrice: 3200, term, source: "unconfigured" as const };
    // #region agent log
    await fetch("http://127.0.0.1:7242/ingest/9011e2dd-5deb-4901-a951-608c0365dbf2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "pricing/route.ts:unconfigured-branch",
        message: "Using mock placeholder (no PARTNER_API_KEY?)",
        data: { source: "unconfigured", testPrice, term },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "MOCK",
      }),
    }).catch(() => {});
    // #endregion
    console.log("[pricing] Response (full):", JSON.stringify({ status: 200, body: resBody }, null, 2));
    return Response.json(resBody, { status: 200 });
  }

  try {
    // Single-office endpoint: GET .../offices/{officeId} (e.g. .../offices/661d6cec86b84705e26b9bdc)
    const partnerPath = `offices/${encodeURIComponent(officeId)}`;
    console.log("[pricing] Outbound Partner API request:", { path: partnerPath, officeId, term });
    // #region agent log
    await fetch("http://127.0.0.1:7242/ingest/9011e2dd-5deb-4901-a951-608c0365dbf2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "pricing/route.ts:before-partnerApiGet",
        message: "Partner path (H2/H5)",
        data: { partnerPath, officeId, term },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "H2_H5",
      }),
    }).catch(() => {});
    // #endregion
    const res = await partnerApiGet<PartnerApiOffice | PartnerApiOfficeListResponse>(partnerPath);
    const office = toSingleOffice(res, officeId);

    const resolved =
      office?.prices && Array.isArray(office.prices)
        ? resolvePriceFromPrices(office.prices, term)
        : null;

    const price =
      resolved !== null && resolved > 0
        ? Math.round(resolved)
        : 0;

    const resBody = { price, term };
    // #region agent log
    await fetch("http://127.0.0.1:7242/ingest/9011e2dd-5deb-4901-a951-608c0365dbf2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "pricing/route.ts:partner-api-success",
        message: "Real price from Partner API",
        data: {
          source: "partner-api",
          officeFound: !!office,
          hasPrices: !!(office?.prices && office.prices.length > 0),
          resolved,
          price,
          term,
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "MOCK",
      }),
    }).catch(() => {});
    // #endregion
    console.log("[pricing] Response (full):", JSON.stringify({ status: 200, body: resBody }, null, 2));
    return Response.json(resBody);
  } catch (err) {
    // #region agent log
    await fetch("http://127.0.0.1:7242/ingest/9011e2dd-5deb-4901-a951-608c0365dbf2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "pricing/route.ts:partner-api-error",
        message: "Partner API call failed",
        data: { error: String(err), officeId },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "MOCK",
      }),
    }).catch(() => {});
    // #endregion
    console.error("[pricing] Partner API error:", err);
    const resBody = { error: "Failed to fetch price", price: 0 };
    return Response.json(resBody, { status: 500 });
  }
}
