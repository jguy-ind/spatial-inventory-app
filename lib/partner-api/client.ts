/**
 * Partner API HTTP client.
 * Base URL and API key from env; auth header: Authorization: [apikey]
 */

const BASE_URL =
  process.env.PARTNER_API_BASE_URL ??
  "https://api-gateway.industriousoffice.com/inventory/partners/v1.1.0/";
const API_KEY = process.env.PARTNER_API_KEY ?? "";

function getBaseUrl(): string {
  const url = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
  return url;
}

export function getPartnerApiKey(): string {
  return API_KEY;
}

export function isPartnerApiConfigured(): boolean {
  return Boolean(API_KEY && BASE_URL);
}

/**
 * GET request to Partner API. Path is relative to base URL (e.g. "locations", "offices").
 * Auth: Authorization header with raw API key.
 */
export async function partnerApiGet<T>(path: string): Promise<T> {
  const baseUrl = getBaseUrl();
  const pathOnly = path.startsWith("http") ? path : path.replace(/^\//, "");
  const fullEndpoint = path.startsWith("http") ? path : `${baseUrl}${pathOnly}`;
  console.log("[Partner API] Request (entire):", {
    method: "GET",
    baseUrl,
    path: pathOnly,
    fullEndpoint,
  });
  const res = await fetch(fullEndpoint, {
    method: "GET",
    headers: {
      Authorization: API_KEY,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/9011e2dd-5deb-4901-a951-608c0365dbf2", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "partner-api/client.ts:after-fetch",
      message: "Partner API response (H2/H5: 404 from Partner API?)",
      data: { status: res.status, ok: res.ok, fullEndpoint, pathOnly },
      timestamp: Date.now(),
      sessionId: "debug-session",
      hypothesisId: "H2_H5",
    }),
  }).catch(() => {});
  // #endregion
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Partner API ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}
