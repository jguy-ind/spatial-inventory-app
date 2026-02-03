/**
 * Parses short-hills-regions.csv and adds floorPlanRegions to the Short Hills
 * location in inventory-service-prod.locations.json.
 * Run: node scripts/add-regions-to-locations.js
 */

const fs = require("fs");
const path = require("path");

const csvPath = path.join(__dirname, "../public/short-hills-regions.csv");
const locationsPath = path.join(
  __dirname,
  "../inventory-service-prod.locations.json"
);

function parseRegionsCsv(csvString) {
  const lines = csvString.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) return [];
  const headerLine = lines[0].toLowerCase();
  const dataStart = headerLine.includes("office name") ? 1 : 0;
  const rows = [];
  for (let i = dataStart; i < lines.length; i++) {
    const parts = lines[i].split(",").map((p) => p.trim());
    if (parts.length < 4) continue;
    const [officeName, pathIdStr, xStr, yStr, location] = parts;
    const pathId = parseInt(pathIdStr, 10);
    const x = parseFloat(xStr);
    const y = parseFloat(yStr);
    if (isNaN(pathId) || isNaN(x) || isNaN(y)) continue;
    rows.push({ officeName, pathId, x, y, location: location ?? "" });
  }
  const byOffice = new Map();
  for (const row of rows) {
    const list = byOffice.get(row.officeName) ?? [];
    list.push(row);
    byOffice.set(row.officeName, list);
  }
  const regions = [];
  for (const [officeName, list] of byOffice) {
    list.sort((a, b) => a.pathId - b.pathId);
    const points = list.map((r) => ({ x: r.x, y: r.y }));
    regions.push({
      id: officeName,
      label: officeName,
      location: list[0]?.location || undefined,
      points,
    });
  }
  return regions;
}

const csv = fs.readFileSync(csvPath, "utf-8");
const regions = parseRegionsCsv(csv);

const locations = JSON.parse(fs.readFileSync(locationsPath, "utf-8"));

// Match Short Hills location (address 1200 Morris Turnpike or legalEntityName)
const shortHillsMatch = (loc) =>
  (loc.address && loc.address.includes("1200 Morris")) ||
  (loc.legalEntityName && loc.legalEntityName.includes("Short Hills"));

for (const loc of locations) {
  if (shortHillsMatch(loc)) {
    loc.floorPlanRegions = regions;
    console.log(
      `Added ${regions.length} floor plan regions to ${loc.legalEntityName || loc.address}`
    );
  } else {
    loc.floorPlanRegions = [];
  }
}

fs.writeFileSync(
  locationsPath,
  JSON.stringify(locations, null, 2),
  "utf-8"
);
console.log("Updated inventory-service-prod.locations.json");
