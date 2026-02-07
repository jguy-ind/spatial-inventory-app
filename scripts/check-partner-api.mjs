#!/usr/bin/env node
/**
 * Check Partner API connectivity. Requires PARTNER_API_KEY and optionally
 * PARTNER_API_BASE_URL in env. Load .env.local manually if needed:
 *   node --env-file=.env.local scripts/check-partner-api.mjs
 * or: source .env.local 2>/dev/null; node scripts/check-partner-api.mjs
 */
const BASE_URL =
  process.env.PARTNER_API_BASE_URL ??
  "https://api-gateway.industriousoffice.com/inventory/partners/v1.1.0/";
const API_KEY = process.env.PARTNER_API_KEY ?? "";

function getBaseUrl() {
  const url = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
  return url;
}

async function partnerApiGet(path) {
  const baseUrl = getBaseUrl();
  const pathOnly = path.startsWith("http") ? path : path.replace(/^\//, "");
  const fullUrl = path.startsWith("http") ? path : `${baseUrl}${pathOnly}`;
  const res = await fetch(fullUrl, {
    method: "GET",
    headers: {
      Authorization: API_KEY,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  return { ok: res.ok, status: res.status, url: fullUrl, body: await res.text() };
}

async function main() {
  if (!API_KEY) {
    console.error("Missing PARTNER_API_KEY. Set it in .env.local or env.");
    process.exit(1);
  }
  const baseUrl = getBaseUrl();
  console.log("Partner API check");
  console.log("Base URL:", baseUrl);
  console.log("");

  const results = [];

  // 1. GET locations
  const locRes = await partnerApiGet("locations");
  results.push({
    name: "GET locations",
    url: locRes.url,
    status: locRes.status,
    ok: locRes.ok,
  });
  if (!locRes.ok) {
    console.error("GET locations failed:", locRes.status, locRes.body?.slice(0, 200));
  } else {
    let parsed;
    try {
      parsed = JSON.parse(locRes.body);
    } catch {
      parsed = null;
    }
    const count =
      Array.isArray(parsed) ? parsed.length : parsed?.data?.length ?? parsed?.locations?.length ?? "?";
    console.log("GET locations:", locRes.status, "– count:", count);
  }

  // 2. GET offices
  const offRes = await partnerApiGet("offices");
  results.push({
    name: "GET offices",
    url: offRes.url,
    status: offRes.status,
    ok: offRes.ok,
  });
  if (!offRes.ok) {
    console.error("GET offices failed:", offRes.status, offRes.body?.slice(0, 200));
  } else {
    let parsed;
    try {
      parsed = JSON.parse(offRes.body);
    } catch {
      parsed = null;
    }
    const offices = Array.isArray(parsed)
      ? parsed
      : parsed?.data ?? parsed?.offices ?? [];
    const count = offices.length;
    const firstId =
      offices[0]?._id?.$oid ?? offices[0]?.id ?? offices[0]?._id;
    console.log("GET offices:", offRes.status, "– count:", count, "first id:", firstId ?? "n/a");
  }

  // 3. GET offices/{id} (single office – for pricing/drawer)
  let offParsed;
  try {
    offParsed = JSON.parse((await partnerApiGet("offices")).body);
  } catch {
    offParsed = null;
  }
  const offices = Array.isArray(offParsed)
    ? offParsed
    : offParsed?.data ?? offParsed?.offices ?? [];
  const firstOfficeId =
    typeof offices[0]?._id === "object" && offices[0]?._id?.$oid
      ? offices[0]._id.$oid
      : offices[0]?.id ?? offices[0]?._id;

  if (firstOfficeId) {
    const singleRes = await partnerApiGet(`offices/${firstOfficeId}`);
    results.push({
      name: `GET offices/${firstOfficeId}`,
      url: singleRes.url,
      status: singleRes.status,
      ok: singleRes.ok,
    });
    if (!singleRes.ok) {
      console.error("GET offices/{id} failed:", singleRes.status, singleRes.body?.slice(0, 200));
    } else {
      console.log("GET offices/" + firstOfficeId + ":", singleRes.status, "OK");
    }
  } else {
    console.log("GET offices/{id}: skipped (no office id from list)");
  }

  const allOk = results.every((r) => r.ok);
  console.log("");
  if (allOk) {
    console.log("All required API calls succeeded.");
    process.exit(0);
  } else {
    console.log("Some calls failed:", results.filter((r) => !r.ok).map((r) => r.name + " " + r.status));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
