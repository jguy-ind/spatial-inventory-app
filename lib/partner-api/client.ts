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
  const base = getBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path.replace(/^\//, "")}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: API_KEY,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Partner API ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}
